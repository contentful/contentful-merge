import { CreateChangesetContext } from './types'
import {
  icons,
  pluralizeEntry,
  OutputFormatter,
  entityStatRenderer,
  affectedEntitiesIds,
  pluralizeContentType,
  divergedContentTypeIdsOfAffectedEntries,
} from '../utils'

import chalk from 'chalk'

const entryChangeRenderer = entityStatRenderer({
  icon: icons.bulletPoint,
  pluralizer: pluralizeEntry,
})

const successfulEntryChangeRenderer = entityStatRenderer({
  icon: icons.greenCheckmark,
  pluralizer: pluralizeEntry,
})

const renderDivergedContentTypes = (contentTypeIds: string[]) => {
  return `${contentTypeIds.map((id) => chalk.italic.yellow(id)).join(', ')}`
}

export async function renderOutput(context: CreateChangesetContext, changesetFilePath: string, logFilePath: string) {
  let output = '\n'
  const entriesAddedLength = context.affectedEntities.entries.added.length
  const entriesRemovedLength = context.affectedEntities.entries.removed.length
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  const hasErrors = context.contentModelDiverged || context.exceedsLimits

  if (hasErrors) {
    let errorMessage = '\n'
    let entriesChangedMessage = ''
    if (context.contentModelDiverged) {
      errorMessage += `The content models of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.`
      const entriesChangedLength = context.affectedEntities.entries.changed.length
      entriesChangedMessage = `${entryChangeRenderer(entriesChangedLength)} changed`
    } else if (context.exceedsLimits) {
      errorMessage += `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`
      const entriesMaybeChangedLength = context.affectedEntities.entries.maybeChanged.length
      entriesChangedMessage = `${entryChangeRenderer(entriesMaybeChangedLength)} to be compared`
    }
    output += OutputFormatter.headline('Changeset could not be created 💔')
    output += '\n'
    output += OutputFormatter.error(errorMessage)
    output += '\n'
    output += `\nDetected number of changes:`
    output += '\n'
    output += `\n  ${entryChangeRenderer(entriesAddedLength, 'added')}`
    output += `\n  ${entryChangeRenderer(entriesRemovedLength, 'removed')}`
    output += `\n  ${entriesChangedMessage}`
    output += '\n'

    if (context.contentModelDiverged) {
      const relevantDivergedContentTypeIds = divergedContentTypeIdsOfAffectedEntries(
        context.affectedEntities,
        context.sourceData.entries.comparables
      )

      output += `\nDiverged ${pluralizeContentType(
        relevantDivergedContentTypeIds.length
      )}: ${renderDivergedContentTypes(relevantDivergedContentTypeIds)}`
      output += '\n'
    }
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
