import { Command, Config, Flags } from '@oclif/core'
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

    // const startTime = performance.now()
    await applyChangesetTask(context).run()
    // const endTime = performance.now()

    // const duration = ((endTime - startTime) / 1000).toFixed(1)
    // const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    const output = await renderOutput(context)
    this.log(output)
  }

  async catch(error: any) {
    await this.parse(Apply)

    const output = renderErrorOutputForApply(error)

    this.log(output)
  }

  protected async finally(): Promise<any> {
    await this.writeFileLog()
    this.log(renderFilePaths({ logFilePath: this.logFilePath }))
  }
}
