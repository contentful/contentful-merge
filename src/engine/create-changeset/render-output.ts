import { CreateChangesetContext } from './types'
import { pluralizeContentType, pluralizeEntry } from '../utils/pluralize'
import { icons } from '../utils/icons'
import { entityStatRenderer } from '../utils/entity-stat-renderer'
import { OutputFormatter } from '../utils/output-formatter'

const entryChangeRenderer = entityStatRenderer({
  icon: icons.bulletPoint,
  pluralizer: pluralizeEntry,
})

const contentTypeChangeRenderer = entityStatRenderer({
  icon: icons.bulletPoint,
  pluralizer: pluralizeContentType,
})

const successfulEntryChangeRenderer = entityStatRenderer({
  icon: icons.greenCheckmark,
  pluralizer: pluralizeEntry,
})

export async function renderOutput(context: CreateChangesetContext, changesetFilePath: string, logFilePath: string) {
  let output = '\n'
  const entriesAddedLength = context.affectedEntities.entries.added.length
  const entriesRemovedLength = context.affectedEntities.entries.removed.length
  const entriesMaybeChangedLength = context.affectedEntities.entries.maybeChanged.length
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  const contentTypesAddedLength = context.affectedEntities.contentTypes.added.length
  const contentTypesRemovedLength = context.affectedEntities.contentTypes.removed.length
  const contentTypesMaybeChangedLength = context.affectedEntities.contentTypes.maybeChanged.length

  const hasErrors = context.contentModelDiverged || context.exceedsLimits

  if (hasErrors) {
    let errorMessage = '\n'
    if (context.contentModelDiverged) {
      errorMessage += `The content model of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the merge app here: https://www.contentful.com/marketplace/app/merge.`
    } else if (context.exceedsLimits) {
      errorMessage += `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`
    }
    output += OutputFormatter.headline('Changeset could not be created 💔')
    output += '\n'
    output += OutputFormatter.error(errorMessage)
    output += '\n'
    output += `\nDetected number of changes:`
    output += '\n'
    output += `\n  ${entryChangeRenderer(entriesAddedLength, 'added')}`
    output += `\n  ${entryChangeRenderer(entriesRemovedLength, 'removed')}`
    output += `\n  ${entryChangeRenderer(entriesMaybeChangedLength)} to be compared`
    output += '\n'
    output += `\n  ${contentTypeChangeRenderer(contentTypesAddedLength, 'added')}`
    output += `\n  ${contentTypeChangeRenderer(contentTypesRemovedLength, 'removed')}`
    output += `\n  ${contentTypeChangeRenderer(contentTypesMaybeChangedLength)} to be compared`
    output += '\n'
  } else {
    output += OutputFormatter.headline('Changeset successfully created 🎉')

    output += `\n  ${successfulEntryChangeRenderer(sourceEntriesLength)} detected in the source environment "${
      context.sourceEnvironmentId
    }"`
    output += `\n  ${successfulEntryChangeRenderer(targetEntriesLength)} detected in the target environment "${
      context.targetEnvironmentId
    }"`
    output += '\n'
    output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.added, 'added')}`
    output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.changed, 'changed')}`
    output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.removed, 'removed')}`
    output += '\n'

    output += `\n💾 ${changesetFilePath}`
  }

  output += `\n📖 ${logFilePath}`

  return output
}
