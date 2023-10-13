import { Command, Config, Flags } from '@oclif/core'
import { MemoryLogger } from '../../engine/logger/memory-logger'
import { createTransformHandler } from '../../engine/logger/create-transform-handler'
import { createClient } from '../../engine/client'
import { ResponseStatusCollector } from '../../engine/client/response-status-collector'
import * as Sentry from '@sentry/node'
import { createChangeset } from '../../engine/utils/create-changeset'
import { ApplyChangesetContext } from '../../engine/apply-changeset/types'
import chalk from 'chalk'
import { applyChangesetTask } from '../../engine/apply-changeset'
import { writeLog } from '../../engine/logger/write-log'
import { OutputFormatter, renderFilePaths } from '../../engine/utils'
import { renderErrorOutputForApply } from '../../engine/utils/render-error-output'
import crypto from 'crypto'
import { renderOutput } from '../../engine/apply-changeset/render-output'
import {
  analyticsCloseAndFlush,
  initSentry,
  trackApplyCommandCompleted,
  trackApplyCommandFailed,
  trackApplyCommandStarted,
} from '../../analytics'

initSentry()

const sequenceKey = crypto.randomUUID()

export default class Apply extends Command {
  static description = 'Apply Changeset'
  private logFilePath: string | undefined
  private logger: MemoryLogger

  constructor(argv: string[], config: Config) {
    super(argv, config)

    this.logger = new MemoryLogger('apply-changeset')
  }

  static hidden = true

  static examples = ['contentful-merge apply  --space "<space-id>" --environment "staging" --file changeset.json']

  static flags = {
    space: Flags.string({ description: 'Space id', required: true }),
    environment: Flags.string({ description: 'Target environment id', required: true }),
    file: Flags.string({ description: 'File path to changeset file', required: false, default: 'changeset.json' }),
    'cma-token': Flags.string({
      description: 'CMA token, defaults to env: $CMA_TOKEN',
      required: true,
      env: 'CMA_TOKEN',
    }),
  }

  private async writeFileLog() {
    this.logFilePath = await writeLog(this.logger)
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Apply)

    Sentry.configureScope((scope) => {
      scope.setTag('command', 'apply')
      scope.setTag('spaceId', flags.space)
      scope.setTag('targetEnvironmentId', flags.environment)
    })

    trackApplyCommandStarted({
      space_key: flags.space,
      target_environment_key: flags.environment,
      sequence_key: sequenceKey,
    })

    const logHandler = createTransformHandler(this.logger)

    const client = createClient({
      cmaToken: flags['cma-token'],
      space: flags.space,
      logHandler,
      sequenceKey,
    })

    const responseCollector = new ResponseStatusCollector()

    const context: ApplyChangesetContext = {
      logger: this.logger,
      client,
      responseCollector,
      limit: 100,
      accessToken: flags.token,
      spaceId: flags.space,
      environmentId: flags.environment,
      inputPath: flags.file,
      changeset: createChangeset(flags.source, flags.target),
      processedEntities: {
        entries: { added: [], deleted: [], updated: [] },
      },
    }

    console.log(OutputFormatter.headline(`\nStart applying changeset to ${chalk.yellow(flags.environment)} 📥`))

    const startTime = performance.now()
    const transaction = Sentry.startTransaction({
      op: 'apply',
      name: 'Apply Changeset',
    })

    await applyChangesetTask(context).run()
    transaction?.finish()
    const endTime = performance.now()
    const duration = ((endTime - startTime) / 1000).toFixed(1)

    Sentry.setTag('added', context.processedEntities.entries.added.length)
    Sentry.setTag('removed', context.processedEntities.entries.deleted.length)
    Sentry.setTag('changed', context.processedEntities.entries.updated.length)
    Sentry.setTag('cmaRequest', client.requestCounts().cma)
    Sentry.setTag('duration', `${duration}`)

    trackApplyCommandCompleted({
      space_key: flags.space,
      target_environment_key: flags.target,
      sequence_key: sequenceKey,
      duration: endTime - startTime,
      num_changeset_items: context.changeset.items.length,
      num_added_items: context.processedEntities.entries.added.length,
      num_removed_items: context.processedEntities.entries.deleted.length,
      num_changed_items: context.processedEntities.entries.updated.length,
    })

    const output = await renderOutput(context)
    this.log(output)
  }

  async catch(error: any) {
    const { flags } = await this.parse(Apply)

    trackApplyCommandFailed({
      space_key: flags.space,
      target_environment_key: flags.target,
      sequence_key: sequenceKey,
      error_name: error.name,
      error_message: error.message,
      ...(error.details ? { error_details: JSON.stringify(error.details) } : {}),
    })

    const output = renderErrorOutputForApply(error)

    Sentry.captureException(error)

    this.log(output)
  }

  protected async finally(): Promise<any> {
    await this.writeFileLog()
    this.log(renderFilePaths({ logFilePath: this.logFilePath }))

    // analyticsCloseAndFlush has a very short timeout because it will
    // otherwise trigger a rerender of the listr tasks on error exits
    await Promise.allSettled([Sentry.close(2000), analyticsCloseAndFlush(2000)])
  }
}
