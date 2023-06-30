import chalk from 'chalk'
import { CreateChangesetContext } from './types'
import { pluralizeEntries } from '../utils/pluralize-entries'
import { figures } from 'listr2'

const formatNumber = chalk.yellow.bold

const bulletPoint = chalk.yellow('·')
const greenCheckmark = chalk.green(figures.tick)

export async function renderOutput(context: CreateChangesetContext, changesetFilePath: string, logFilePath: string) {
  let output = '\n'
  if (context.exceedsLimits) {
    const errorMessage = `\nThe detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`

    output += chalk.underline.bold('Changeset could not be created 💔')
    output += '\n'
    output += chalk.redBright(errorMessage)
    output += '\n'
    output += `\nDetected number of changes:`
    output += `\n  ${bulletPoint} ${formatNumber(context.ids.added.length)} added ${pluralizeEntries(
      context.ids.added.length
    )}`
    output += `\n  ${bulletPoint} ${formatNumber(context.ids.removed.length)} removed ${pluralizeEntries(
      context.ids.removed.length
    )}`
    output += `\n  ${bulletPoint} ${formatNumber(context.maybeChanged.length)} ${pluralizeEntries(
      context.maybeChanged.length
    )} to be compared`
    output += '\n'
  } else {
    output += chalk.underline.bold('Changeset successfully created 🎉')

    output += `\n  ${greenCheckmark} ${formatNumber(context.source.ids.length)} ${pluralizeEntries(
      context.source.ids.length
    )} detected in the source environment "${context.sourceEnvironmentId}"`
    output += `\n  ${greenCheckmark} ${formatNumber(context.target.ids.length)} ${pluralizeEntries(
      context.target.ids.length
    )} detected in the target environment "${context.targetEnvironmentId}"`

    output += `\n  ${greenCheckmark} ${formatNumber(context.statistics.added)} added ${pluralizeEntries(
      context.statistics.added
    )}`
    output += `\n  ${greenCheckmark} ${formatNumber(context.statistics.changed)} changed ${pluralizeEntries(
      context.statistics.changed
    )}`
    output += `\n  ${greenCheckmark} ${formatNumber(context.statistics.removed)} removed ${pluralizeEntries(
      context.statistics.removed
    )}`
    output += '\n'

    output += `\n💾 ${changesetFilePath}`
  }

  output += `\n📖 ${logFilePath}`

  return output
}
