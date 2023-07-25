import { Command, Config, Flags } from '@oclif/core'
import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'
import chalk from 'chalk'
import crypto from 'crypto'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { analyticsCloseAndFlush, trackCreateCommandCompleted, trackCreateCommandStarted } from '../../analytics'
import { createClient } from '../../engine/client'
import { createChangesetTask } from '../../engine/create-changeset'
import { CreateChangesetContext } from '../../engine/create-changeset/types'
import { createTransformHandler } from '../../engine/logger/create-transform-handler'
import { MemoryLogger } from '../../engine/logger/memory-logger'
import { writeLog } from '../../engine/logger/write-log'
import { createChangeset } from '../../engine/utils/create-changeset'
import { renderOutput } from '../../engine/create-changeset/render-output'
import { OutputFormatter } from '../../engine/utils/output-formatter'
import { config } from '../../config'
import { renderErrorOutput } from '../../engine/utils/render-error-output'
import { renderFilePaths } from '../../engine/create-changeset/render-file-paths'

Sentry.init({
  dsn: 'https://5bc27276ac684a56bab07632be10a455@o2239.ingest.sentry.io/4505312653410304',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [new ProfilingIntegration()],
  environment: config.environment,
})

const limits = {
  all: 100,
  changed: 100,
  added: 100,
  removed: 100,
}

const sequenceKey = crypto.randomUUID()

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  private changesetFilePath: string
  private logFilePath: string | undefined
  private logger: MemoryLogger

  constructor(argv: string[], config: Config) {
    super(argv, config)

    this.changesetFilePath = path.join(process.cwd(), 'changeset.json')
    this.logger = new MemoryLogger('create-changeset')
  }

  static examples = [
    'contentful-merge create --space "<space id>" --source "<source environment id>" --target "<target environment id>" --cda-token <cda token>',
    'contentful-merge create --space "<space id>" --source "<source environment id>" --target "<target environment id>" --cda-token <cda token> --limit 100',
  ]

  static flags = {
    space: Flags.string({ description: 'Space id', required: true }),
    source: Flags.string({ description: 'Source environment id', required: true }),
    target: Flags.string({ description: 'Target environment id', required: true }),
    'cda-token': Flags.string({
      description: 'CDA token, defaults to env: $CDA_TOKEN',
      required: true,
      env: 'CDA_TOKEN',
    }),
    limit: Flags.integer({ description: 'Limit parameter for collection endpoints', required: false, default: 200 }),
  }

  private async writeFileLog() {
    this.logFilePath = await writeLog(this.logger)
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Create)

    Sentry.configureScope((scope) => {
      scope.setTag('command', 'create')
      scope.setTag('spaceId', flags.space)
      scope.setTag('sourceEnvironmentId', flags.source)
      scope.setTag('targetEnvironmentId', flags.target)
      scope.setExtra('limits', limits)
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
      limit: flags.limit,
      accessToken: flags.token,
      spaceId: flags.space,
      sourceEnvironmentId: flags.source,
      targetEnvironmentId: flags.target,
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
      changeset: createChangeset(flags.source, flags.target),
      limits,
      exceedsLimits: false,
      contentModelDiverged: false,
    }

    console.log(
      OutputFormatter.headline(
        `\nStart changeset creation for ${chalk.yellow(flags.source)} => ${chalk.yellow(flags.target)} 🎬`
      )
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

    Sentry.setTag('limitsExceeded', context.exceedsLimits)
    Sentry.setTag('added', context.affectedEntities.entries.added.length)
    Sentry.setTag('removed', context.affectedEntities.entries.removed.length)
    Sentry.setTag('maybeChanged', context.affectedEntities.entries.maybeChanged.length)
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
      num_changed_items: context.affectedEntities.entries.maybeChanged.length,
      num_source_entries: context.sourceData.entries.ids.length,
      num_target_entries: context.targetData.entries.ids.length,
      num_changeset_items_exceeded: context.exceedsLimits,
    })

    if (context.exceedsLimits) {
      Sentry.captureMessage('Max allowed changes exceeded')
    } else {
      await fs.writeFile(this.changesetFilePath, JSON.stringify(context.changeset, null, 2))
    }

    const output = await renderOutput(context)
    this.log(output)
  }

  async catch(error: any) {
    // Any additional error handling or related user warnings should
    // go here if possible.

    const output = renderErrorOutput(error)

    Sentry.captureException(error)

    this.log(output)
    this.exit(1)
  }

  protected async finally(): Promise<any> {
    await this.writeFileLog()
    this.log(renderFilePaths(this.changesetFilePath, this.logFilePath))

    // analyticsCloseAndFlush has a very short timeout because it will
    // otherwise trigger a rerender of the listr tasks on error exits
    await Promise.allSettled([Sentry.close(2000), analyticsCloseAndFlush(2000)])
  }
}
