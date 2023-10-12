import { Command, Config, Flags, ux } from '@oclif/core'
import { MemoryLogger } from '../../engine/logger/memory-logger'
import { createTransformHandler } from '../../engine/logger/create-transform-handler'
import { createClient } from '../../engine/client'
import { ResponseStatusCollector } from '../../engine/client/response-status-collector'
import { createChangeset } from '../../engine/utils/create-changeset'
import { ApplyChangesetContext } from '../../engine/apply-changeset/types'
import chalk from 'chalk'
import { applyChangesetTask } from '../../engine/apply-changeset'
import { writeLog } from '../../engine/logger/write-log'
import { OutputFormatter, renderFilePaths } from '../../engine/utils'
import { renderErrorOutputForApply } from '../../engine/utils/render-error-output'
import crypto from 'crypto'
import { renderOutput } from '../../engine/apply-changeset/render-output'
import { loadChangeset } from '../../engine/apply-changeset/load-changeset'
import { renderWarnings, collectWarnings } from '../../engine/apply-changeset/warnings'
import {
  analyticsCloseAndFlush,
  trackApplyCommandCompleted,
  trackApplyCommandFailed,
  trackApplyCommandStarted,
} from '../../analytics'

const sequenceKey = crypto.randomUUID()

export default class Apply extends Command {
  static description = 'Apply Changeset'
  private logFilePath: string | undefined
  private logger: MemoryLogger
  private terminatedByUser = false

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

    const changeset = await loadChangeset(flags.file)

    const confirmation = renderWarnings(
      collectWarnings({
        changeset,
        environmentId: flags.environment,
      })
    )

    const answer = await ux.prompt(confirmation, { default: 'Y' })

    if (!['Y', 'y'].includes(answer)) {
      this.terminatedByUser = true
      return
    }

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
    await applyChangesetTask(context).run()
    const endTime = performance.now()

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

    this.log(output)
  }

  protected async finally(): Promise<any> {
    if (this.terminatedByUser) return
    await this.writeFileLog()
    this.log(renderFilePaths({ logFilePath: this.logFilePath }))

    // analyticsCloseAndFlush has a very short timeout because it will
    // otherwise trigger a rerender of the listr tasks on error exits
    await Promise.allSettled([analyticsCloseAndFlush(2000)])
  }
}
