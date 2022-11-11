import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {applyChangesetTask} from '../../engine/apply-changeset'
import {ApplyChangesetContext} from '../../engine/apply-changeset/types'
import {createClient} from '../../engine/client'
import {ResponseStatusCollector} from '../../engine/client/response-status-collector'
import {createTransformHandler} from '../../engine/logger/create-transform-handler'
import {MemoryLogger} from '../../engine/logger/memory-logger'
import {writeLog} from '../../engine/logger/write-log'
import {createChangeset} from '../../engine/utils/create-changeset'

export default class Apply extends Command {
  static description = 'Apply Changeset'

  static examples = [
    './bin/dev apply changeset.json --space "<space-id>" --environment "staging"',
    'ccccli apply changeset.json --space "<space-id>" --environment "staging"',
  ]

  static args = [
    {name: 'input', required: false, default: 'changeset.json'},
  ]

  static flags = {
    space: Flags.string({description: 'space id', required: true}),
    environment: Flags.string({description: 'source environment id', required: true}),
    cmaToken: Flags.string({description: 'cma token', required: false, env: 'CMA_TOKEN'}),
    cdaToken: Flags.string({description: 'cda token', required: false, env: 'CDA_TOKEN'}),
    limit: Flags.integer({description: 'Limit parameter for collection endpoints', required: false, default: 200}),
  }

  async run(): Promise<void> {
    const {flags, args} = await this.parse(Apply)

    const logger = new MemoryLogger('apply-changeset')
    const logHandler = createTransformHandler(logger)

    const client = createClient({
      cdaToken: flags.cdaToken!,
      cmaToken: flags.cmaToken!,
      space: flags.space,
      logHandler,
    })

    const responseCollector = new ResponseStatusCollector()

    const context: ApplyChangesetContext = {
      logger,
      client,
      responseCollector,
      limit: flags.limit,
      accessToken: flags.token,
      spaceId: flags.space,
      environmentId: flags.environment,
      inputPath: args.input,
      changeSet: createChangeset(flags.source, flags.target),
    }

    console.log(chalk.underline.bold('\nStart applying changeset'))

    const startTime = performance.now()
    const result = await applyChangesetTask(context).run()
    const endTime = performance.now()

    const duration = ((endTime - startTime) / 1000).toFixed(1)
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024
    const formatNumber = chalk.yellow.bold

    const logFilePath = await writeLog(result.logger)
    let output = '\n'
    output += chalk.underline.bold('Changeset successfully applied 🎉')
    output += `\nApplied a changeset with ${formatNumber(context.changeSet.items.length)} changes to ${flags.environment}`
    output += `\nOverall ${formatNumber(client.requestCounts().cda)} CDA and `
    output += `${formatNumber(client.requestCounts().cma)} CMA request were fired within ${formatNumber(duration)} seconds.`
    output += `\nThe process used approximately ${formatNumber(usedMemory.toFixed(2))} MB memory.`
    output += '\n'
    output += `\n📖 ${logFilePath}`

    console.log(output)

    console.log(responseCollector.toString())
  }
}
