import { Command, Config, Flags } from '@oclif/core'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import crypto from 'crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import {
  analyticsCloseAndFlush,
  initSentry,
  trackCreateCommandCompleted,
  trackCreateCommandFailed,
  trackCreateCommandStarted,
} from '../../analytics'
import { createClient } from '../../engine/client'
import { createChangesetTask } from '../../engine/create-changeset'
import { CreateChangesetContext } from '../../engine/create-changeset/types'
import { createTransformHandler } from '../../engine/logger/create-transform-handler'
import { MemoryLogger } from '../../engine/logger/memory-logger'
import { writeLog } from '../../engine/logger/write-log'
import { createChangeset } from '../../engine/utils/create-changeset'
import { renderOutput } from '../../engine/create-changeset/render-output'
import { renderErrorOutputForCreate } from '../../engine/utils/render-error-output'
import { detectErrorLevel, OutputFormatter, renderFilePaths } from '../../engine/utils'
import { config } from '../../config'
import cleanStack from 'clean-stack'

initSentry()

const sequenceKey = crypto.randomUUID()

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  private changesetFilePath: string | undefined
  private logFilePath: string | undefined
  private readonly logger: MemoryLogger

  constructor(argv: string[], config: Config) {
    super(argv, config)

    this.logger = new MemoryLogger('create-changeset')
  }

  static examples = [
    'contentful-merge create --space "<space id>" --source "<source environment id>" --target "<target environment id>" --cda-token <cda token> --output-file <output file path> --content-type <content type id>',
  ]

  static flags = {
    space: Flags.string({ default: undefined, description: 'Space id', required: true }),
    source: Flags.string({ default: undefined, description: 'Source environment id', required: true }),
    target: Flags.string({ default: undefined, description: 'Target environment id', required: true }),
    'cda-token': Flags.string({
      default: undefined,
      description: 'CDA token, defaults to env: $CDA_TOKEN',
      required: true,
      env: 'CDA_TOKEN',
    }),
    'request-batch-size': Flags.integer({ description: 'Limit for every single request', default: 1000 }),
    'output-file': Flags.string({ default: undefined, description: 'File path to changeset file', required: false }),
    'content-type': Flags.string({ default: undefined, description: 'Content type id', required: false }),
  }

  private async writeFileLog() {
    this.logFilePath = await writeLog(this.logger)
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Create)

    if (flags.source === flags.target) {
      this.log('Source and target environment need to be different.')
      process.exit(1)
    }

    Sentry.configureScope((scope) => {
      scope.setTag('command', 'create')
      scope.setTag('spaceId', flags.space)
      scope.setTag('sourceEnvironmentId', flags.source)
      scope.setTag('targetEnvironmentId', flags.target)
      scope.setExtra('limits', config.limits)
    })
    trackCreateCommandStarted({
      space_key: flags.space,
      target_environment_key: flags.target,
      source_environment_key: flags.source,
      sequence_key: sequenceKey,
    })

    const logHandler = createTransformHandler(this.logger)

    const client = createClient({
      cdaToken: flags['cda-token'],
      space: flags.space,
      logHandler,
      sequenceKey,
    })

    const context: CreateChangesetContext = {
      logger: this.logger,
      client,
      contentType: flags['content-type'],
      accessToken: flags.token,
      spaceId: flags.space,
      sourceEnvironmentId: flags.source,
      targetEnvironmentId: flags.target,
      requestBatchSize: flags['request-batch-size'],
      sourceData: {
        entries: { comparables: [], ids: [] },
        contentTypes: { comparables: [], ids: [] },
      },
      targetData: {
        entries: { comparables: [], ids: [] },
        contentTypes: { comparables: [], ids: [] },
      },
      affectedEntities: {
        entries: { added: [], removed: [], maybeChanged: [], changed: [] },
        contentTypes: { added: [], removed: [], maybeChanged: [], changed: [] },
      },
      statistics: {
        entries: {
          added: 0,
          changed: 0,
          removed: 0,
          nonChanged: 0,
        },
        contentTypes: {
          added: 0,
          changed: 0,
          removed: 0,
          nonChanged: 0,
        },
      },
      changeset: createChangeset(flags.source, flags.target, flags.space),
      limits: config.limits,
    }

    console.log(
      OutputFormatter.headline(
        `\nStart changeset creation for ${chalk.yellow(flags.source)} => ${chalk.yellow(flags.target)} 🎬`,
      ),
    )

    const startTime = performance.now()
    const transaction = Sentry.startTransaction({
      op: 'create',
      name: 'Create Changeset',
    })

    const createChangesetTaskInstance = createChangesetTask(context)

    await createChangesetTaskInstance.run()

    transaction?.finish()

    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    Sentry.setTag('added', context.affectedEntities.entries.added.length)
    Sentry.setTag('removed', context.affectedEntities.entries.removed.length)
    Sentry.setTag('maybeChanged', context.affectedEntities.entries.maybeChanged.length)
    Sentry.setTag('changed', context.affectedEntities.entries.changed.length)
    Sentry.setTag('cdaRequest', client.requestCounts().cda)
    Sentry.setTag('cmaRequest', client.requestCounts().cma)
    Sentry.setTag('memory', usedMemory.toFixed(2))
    Sentry.setTag('duration', `${duration}`)
    Sentry.setExtra('statistics', context.statistics)

    trackCreateCommandCompleted({
      space_key: flags.space,
      target_environment_key: flags.target,
      source_environment_key: flags.source,
      sequence_key: sequenceKey,
      duration: endTime - startTime,
      num_changeset_items: context.changeset.items.length,
      num_added_items: context.affectedEntities.entries.added.length,
      num_removed_items: context.affectedEntities.entries.removed.length,
      num_changed_items: context.affectedEntities.entries.changed.length,
      num_source_entries: context.sourceData.entries.ids.length,
      num_target_entries: context.targetData.entries.ids.length,
    })

    this.changesetFilePath =
      flags['output-file'] ||
      path.join(process.cwd(), `changeset-${Date.now()}-${flags.space}-${flags.source}-${flags.target}.json`)
    await fs.writeFile(this.changesetFilePath, JSON.stringify(context.changeset, null, 2))

    const output = await renderOutput(context)
    this.log(output)
  }

  async catch(error: any) {
    const { flags } = await this.parse(Create)

    trackCreateCommandFailed({
      space_key: flags.space,
      target_environment_key: flags.target,
      source_environment_key: flags.source,
      sequence_key: sequenceKey,
      error_name: error.name,
      error_message: error.message,
      ...(error.details ? { error_details: JSON.stringify(error.details) } : {}),
    })

    const output = renderErrorOutputForCreate(error)

    if (error.stack) {
      error.stack = cleanStack(error.stack, { pretty: true })
    }

    Sentry.captureException(error, {
      level: detectErrorLevel(error),
    })

    this.log(output)
  }

  protected async finally(): Promise<any> {
    await this.writeFileLog()
    this.log(renderFilePaths({ changesetPath: this.changesetFilePath, logFilePath: this.logFilePath }))

    await Promise.allSettled([Sentry.close(2000), analyticsCloseAndFlush(2000)])
  }
}
