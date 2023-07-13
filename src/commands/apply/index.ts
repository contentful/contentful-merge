import { Command } from '@oclif/core'

// const sequenceKey = crypto.randomUUID()

export default class Apply extends Command {
  static description = 'Apply Changeset'

  static hidden = true

  async run(): Promise<void> {
    this.log('The apply command is not implemented yet.')
  }

  /*
  static examples = [
    './bin/dev apply changeset.json --space "<space-id>" --environment "staging"',
    'contentful-merge apply changeset.json --space "<space-id>" --environment "staging"',
  ]

  static args = {
    input: Args.string({ required: false, default: 'changeset.json' }),
  }

  static flags = {
    space: Flags.string({ description: 'Space id', required: true }),
    environment: Flags.string({ description: 'Target environment id', required: true }),
    "cma-token": Flags.string({ description: 'CMA token', required: true, env: 'CMA_TOKEN' }),
    "cda-token": Flags.string({ description: 'CDA token', required: true, env: 'CDA_TOKEN' }),
    limit: Flags.integer({ description: 'Limit parameter for collection endpoints', required: false, default: 200 }),
  }

  async run(): Promise<void> {
    const { flags, args } = await this.parse(Apply)

    const logger = new MemoryLogger('apply-changeset')
    const logHandler = createTransformHandler(logger)

    const client = createClient({
      cdaToken: flags["cda-token"]!,
      cmaToken: flags["cma-token"]!,
      space: flags.space,
      logHandler,
      sequenceKey,
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
      changeset: createChangeset(flags.source, flags.target),
    }

    console.log(chalk.underline.bold('\nStart applying changeset'))

    const startTime = performance.now()
    const result = await applyChangesetTask(context).run()
    const endTime = performance.now()

    const duration = ((endTime - startTime) / 1000).toFixed(1)
    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    const logFilePath = await writeLog(result.logger)
    let output = '\n'
    output += chalk.underline.bold('Changeset successfully applied 🎉')
    output += `\nApplied a changeset with ${OutputFormatter.formatNumber(context.changeset.items.length)} changes to ${
      flags.environment
    }`
    output += `\nOverall ${OutputFormatter.formatNumber(client.requestCounts().cda)} CDA and `
    output += `${OutputFormatter.formatNumber(
      client.requestCounts().cma
    )} CMA request were fired within ${OutputFormatter.formatNumber(duration)} seconds.`
    output += `\nThe process used approximately ${OutputFormatter.formatNumber(usedMemory.toFixed(2))} MB memory.`
    output += '\n'
    output += `\n📖 ${logFilePath}`

    console.log(output)

    // console.log(responseCollector.toString())
  }
   */
}
