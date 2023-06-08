import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import path from 'node:path'
import { createClient } from '../../engine/client'
import { createChangesetTask } from '../../engine/create-changeset'
import { CreateChangesetContext } from '../../engine/create-changeset/types'
import * as fs from 'node:fs/promises'
import { createTransformHandler } from '../../engine/logger/create-transform-handler'
import { MemoryLogger } from '../../engine/logger/memory-logger'
import { writeLog } from '../../engine/logger/write-log'
import { changeSetItemsCount } from '../../engine/utils/changeset-items-count'
import { createChangeset } from '../../engine/utils/create-changeset'

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  static examples = [
    './bin/dev create --space "<space-id>" --source "master>" --target "staging" --token "<cda-token>"',
    'ccccli create --space "<space-id>" --source "master" --target "staging" --token "<cda-token>"',
  ]

  static flags = {
    source: Flags.string({ description: 'source environment id', required: true }),
    target: Flags.string({ description: 'target environment id', required: true }),
    space: Flags.string({ description: 'space id', required: true }),
    cmaToken: Flags.string({ description: 'cma token', required: false, env: 'CMA_TOKEN' }),
    cdaToken: Flags.string({ description: 'cda token', required: false, env: 'CDA_TOKEN' }),
    light: Flags.boolean({ description: 'only creates link object for added entities', required: false }),
    limit: Flags.integer({ description: 'Limit parameter for collection endpoints', required: false, default: 200 }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Create)

    const logger = new MemoryLogger('create-changeset')
    const logHandler = createTransformHandler(logger)

    const client = createClient({
      cdaToken: flags.cdaToken!,
      cmaToken: flags.cmaToken!,
      space: flags.space,
      logHandler,
    })

    const context: CreateChangesetContext = {
      logger,
      client,
      limit: flags.limit,
      accessToken: flags.token,
      spaceId: flags.space,
      sourceEnvironmentId: flags.source,
      targetEnvironmentId: flags.target,
      inline: !flags.light,
      source: { comparables: [], ids: [] },
      target: { comparables: [], ids: [] },
      ids: {
        added: [],
        removed: [],
      },
      changed: [],
      statistics: {
        nonChanged: 0,
      },
      changeSet: createChangeset(flags.source, flags.target),
    }

    console.log(
      chalk.underline.bold(`\nStart changeset creation for ${chalk(flags.source)} => ${chalk(flags.target)} 🎬`)
    )

    const startTime = performance.now()
    const result = await createChangesetTask(context).run()
    const endTime = performance.now()

    const duration = ((endTime - startTime) / 1000).toFixed(1)

    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    const formatNumber = chalk.yellow.bold

    // const changesetFilePath = path.join(process.cwd(), `changeset-${new Date().toISOString()}-${flags.source}_${flags.target}.json`)
    const changesetFilePath = path.join(process.cwd(), 'changeset.json')
    await fs.writeFile(changesetFilePath, JSON.stringify(result.changeSet, null, 2))
    const logFilePath = await writeLog(result.logger)

    let output = '\n'
    output += chalk.underline.bold('Changeset successfully created 🎉')
    output += '\nCreated a new changeset for 2 environments '
    output += `with ${formatNumber(result.source.ids.length)} source `
    output += `entities and ${formatNumber(result.target.ids.length)} target entities. `
    output += `\nThe resulting changeset has ${formatNumber(
      changeSetItemsCount(result.changeSet, 'deleted')
    )} removed, `
    output += `${formatNumber(changeSetItemsCount(result.changeSet, 'added'))} added and `
    output += `${formatNumber(changeSetItemsCount(result.changeSet, 'changed'))} changed entries.`
    output += `\n${formatNumber(result.statistics.nonChanged)} entities were detected with a different ${chalk.gray(
      'sys.updatedAt'
    )} date, but were identical.`
    output += `\nOverall ${formatNumber(client.requestCounts().cda)} CDA and `
    output += `${formatNumber(client.requestCounts().cma)} CMA request were fired within ${formatNumber(
      duration
    )} seconds.`
    output += `\nThe process used approximately ${formatNumber(usedMemory.toFixed(2))} MB memory.`
    output += '\n'
    output += `\n💾 ${changesetFilePath}`
    output += `\n📖 ${logFilePath}`

    console.log(output)
  }
}
