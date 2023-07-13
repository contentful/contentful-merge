import chalk from 'chalk'
import { CreateChangesetContext } from './types'
import { pluralizeEntries } from '../utils/pluralize-entries'
import { figures } from 'listr2'

const formatNumber = chalk.yellow.bold
const bulletPoint = chalk.yellow('·')
const greenCheckmark = chalk.green(figures.tick)

export async function renderOutput(context: CreateChangesetContext, changesetFilePath: string, logFilePath: string) {
  let output = '\n'
  const entriesAddedLength = context.affectedEntities.entries.added.length
  const entriesRemovedLength = context.affectedEntities.entries.removed.length
  const entriesMaybeChangedLength = context.affectedEntities.entries.maybeChanged.length
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  const hasErrors = context.contentModelDiverged || context.exceedsLimits

  if (hasErrors) {
    let errorMessage = '\n'
    if (context.contentModelDiverged) {
      errorMessage += `The content model of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the merge app here: https://www.contentful.com/marketplace/app/merge.
    } else if (context.exceedsLimits) {
      errorMessage += `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`
    }
    output += chalk.underline.bold('Changeset could not be created 💔')
    output += '\n'
    output += chalk.redBright(errorMessage)
    output += '\n'
    output += `\nDetected number of changes:`
    output += `\n  ${bulletPoint} ${formatNumber(entriesAddedLength)} added ${pluralizeEntries(entriesAddedLength)}`
    output += `\n  ${bulletPoint} ${formatNumber(entriesRemovedLength)} removed ${pluralizeEntries(
      entriesRemovedLength
    )}`
    output += `\n  ${bulletPoint} ${formatNumber(entriesMaybeChangedLength)} ${pluralizeEntries(
      entriesMaybeChangedLength
    )} to be compared`
    output += '\n'
  } else {
    output += chalk.underline.bold('Changeset successfully created 🎉')

    output += `\n  ${greenCheckmark} ${formatNumber(sourceEntriesLength)} ${pluralizeEntries(
      sourceEntriesLength
    )} detected in the source environment "${context.sourceEnvironmentId}"`
    output += `\n  ${greenCheckmark} ${formatNumber(targetEntriesLength)} ${pluralizeEntries(
      targetEntriesLength
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
