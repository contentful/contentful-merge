import {Command, Flags} from '@oclif/core'
import chalk from 'chalk'
import {createClient} from '../../engine/client'
import {createChangeset} from '../../engine/create-changeset'
import {CreateChangesetContext} from '../../engine/create-changeset/types'
import * as fs from 'node:fs/promises'

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  static examples = [
    './bin/dev create --space "<space-id>" --source "master>" --target "staging" --token "<cda-token>"',
    'ccccli create --space "<space-id>" --source "master" --target "staging" --token "<cda-token>"',
  ]

  static flags = {
    source: Flags.string({description: 'source environment id', required: true}),
    target: Flags.string({description: 'target environment id', required: true}),
    space: Flags.string({description: 'space id', required: true}),
    token: Flags.string({description: 'cda token', required: true}),
    inline: Flags.boolean({description: 'inline added entity payload', required: false}),
    limit: Flags.integer({description: 'Limit parameter for collection endpoints', required: false, default: 200}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Create)

    const client = createClient({
      accessToken: flags.token,
      space: flags.space,
    })

    const context: CreateChangesetContext = {
      client,
      limit: flags.limit,
      accessToken: flags.token,
      spaceId: flags.space,
      sourceEnvironmentId: flags.source,
      targetEnvironmentId: flags.target,
      inline: flags.inline,
      source: {comparables: [], ids: []},
      target: {comparables: [], ids: []},
      ids: {
        added: [],
        removed: [],
      },
      changed: [],
      statistics: {
        nonChanged: 0,
      },
    }

    console.log(chalk.underline.bold(`\nStart changeset creation for ${chalk(flags.source)} => ${chalk(flags.target)} 🎬`))

    const startTime = performance.now()
    const result = await createChangeset(context).run()
    const endTime = performance.now()

    const duration = ((endTime - startTime) / 1000).toFixed(1)

    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    const formatNumber = chalk.yellow.bold

    let output = '\n'
    output += chalk.underline.bold('Changeset successfully created 🎉')
    output += '\nCreated a new changeset for 2 environments '
    output += `with ${formatNumber(result.source.ids.length)} source `
    output += `entities and ${formatNumber(result.target.ids.length)} target entities. `
    output += `\nThe resulting changeset has ${formatNumber(result.changeset.removed.length)} removed, `
    output += `${formatNumber(result.changeset.added.length)} added and `
    output += `${formatNumber(result.changeset.changed.length)} changed entries.`
    output += `\n${formatNumber(result.statistics.nonChanged)} entities were detected with a different ${chalk.gray('sys.changedAt')} date, but were identical.`
    output += `\nOverall ${formatNumber(client.requestCounts().cda)} CDA and `
    output += `${formatNumber(client.requestCounts().cma)} CMA request were fired within ${formatNumber(duration)} seconds.`
    output += `\nThe process used approximately ${formatNumber(usedMemory.toFixed(2))} MB memory.`
    console.log(output)

    await fs.writeFile('./changeset.json', JSON.stringify(result.changeset, null, 2))
  }
}
