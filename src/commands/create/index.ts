import { Command, Flags } from '@oclif/core'
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
import { changesetItemsCount } from '../../engine/utils/changeset-items-count'
import { createChangeset } from '../../engine/utils/create-changeset'
import { exceedsLimitsForType } from '../../engine/utils/exceeds-limits'

Sentry.init({
  dsn: 'https://5bc27276ac684a56bab07632be10a455@o2239.ingest.sentry.io/4505312653410304',
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [new ProfilingIntegration()],
  // TODO:  we should default to development and set production during a production build
  environment: process.env.CI ? 'development' : 'production',
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

  static examples = [
    './bin/dev create --space "<space-id>" --source "master>" --target "staging" --token "<cda-token>"',
    'contentful-merge create --space "<space-id>" --source "master" --target "staging" --token "<cda-token>"',
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

    const logger = new MemoryLogger('create-changeset')
    const logHandler = createTransformHandler(logger)

    const client = createClient({
      cdaToken: flags.cdaToken!,
      cmaToken: flags.cmaToken!,
      space: flags.space,
      logHandler,
      sequenceKey,
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
      maybeChanged: [],
      statistics: {
        added: 0,
        changed: 0,
        removed: 0,
        nonChanged: 0,
      },
      changeset: createChangeset(flags.source, flags.target),
      limits,
      exceedsLimits: false,
    }

    console.log(
      chalk.underline.bold(`\nStart changeset creation for ${chalk(flags.source)} => ${chalk(flags.target)} 🎬`)
    )

    const startTime = performance.now()
    const transaction = Sentry.startTransaction({
      op: 'create',
      name: 'Create Changeset',
    })
    const result = await createChangesetTask(context).run()
    transaction?.finish()

    const endTime = performance.now()

    if (result.errors) {
      result.errors.map((error: Error) => Sentry.captureException(error))
    }

    const duration = ((endTime - startTime) / 1000).toFixed(1)

    const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024

    const formatNumber = chalk.yellow.bold

    const limitsExceeded = context.exceedsLimits

    Sentry.setTag('limitsExceeded', limitsExceeded)
    Sentry.setTag('added', context.ids.added.length)
    Sentry.setTag('removed', context.ids.removed.length)
    Sentry.setTag('maybeChanged', context.maybeChanged.length)
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
      num_added_items: context.ids.added.length,
      num_removed_items: context.ids.removed.length,
      num_changed_items: context.maybeChanged.length,
      num_source_entries: context.source.ids.length,
      num_target_entries: context.target.ids.length,
      num_changeset_items_exceeded: context.exceedsLimits,
    })

    let output = '\n'
    output += chalk.underline.bold('Changeset successfully created 🎉')
    output += '\nCreated a new changeset for 2 environments '
    output += `with ${formatNumber(result.source.ids.length)} source `
    output += `entities and ${formatNumber(result.target.ids.length)} target entities. `

    output += `\nThe resulting changeset has ${formatNumber(
      changesetItemsCount(result.changeset, 'deleted')
    )} removed, `
    output += `${formatNumber(changesetItemsCount(result.changeset, 'added'))} added and `
    output += `${formatNumber(changesetItemsCount(result.changeset, 'changed'))} changed entries.`
    output += `\n${formatNumber(result.statistics.nonChanged)} entities were detected with a different ${chalk.gray(
      'sys.updatedAt'
    )} date, but were identical.`
    output += `\nOverall ${formatNumber(client.requestCounts().cda)} CDA and `
    output += `${formatNumber(client.requestCounts().cma)} CMA request were fired within ${formatNumber(
      duration
    )} seconds.`

    output += `\nThe process used approximately ${formatNumber(usedMemory.toFixed(2))} MB memory.`
    output += '\n'

    if (limitsExceeded) {
      output += chalk.redBright(
        `\nThe selected environments have too many changes, we currently only allow a max of ${context.limits.all} changes`
      )
      output += '\n'
    } else {
      // const changesetFilePath = path.join(process.cwd(), `changeset-${new Date().toISOString()}-${flags.source}_${flags.target}.json`)
      const changesetFilePath = path.join(process.cwd(), 'changeset.json')
      await fs.writeFile(changesetFilePath, JSON.stringify(result.changeset, null, 2))
      output += `\n💾 ${changesetFilePath}`
    }

    const logFilePath = await writeLog(result.logger)
    output += `\n📖 ${logFilePath}`

    this.log(output)

    if (context.exceedsLimits) {
      Sentry.captureMessage('Max allowed changes exceeded')
    }
  }

  protected async finally(error: Error | undefined): Promise<any> {
    if (error) {
      Sentry.captureException(error)
    }
    await Promise.allSettled([Sentry.close(2000), analyticsCloseAndFlush(2000)])
    return super.finally(error)
  }
}
