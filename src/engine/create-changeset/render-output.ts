import { CreateChangesetContext } from './types'
import {
  icons,
  pluralizeEntry,
  OutputFormatter,
  entityStatRenderer,
  pluralizeContentType,
  divergedContentTypeIdsOfAffectedEntries,
} from '../utils'

import chalk from 'chalk'

const successfulEntryChangeRenderer = entityStatRenderer({
  icon: icons.greenCheckmark,
  pluralizer: pluralizeEntry,
})

const renderDivergedContentTypes = (contentTypeIds: string[]) => {
  return `${contentTypeIds.map((id) => chalk.italic.yellow(id)).join(', ')}`
}

export async function renderOutput(context: CreateChangesetContext) {
  let output = '\n'
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  const hasErrors = context.contentModelDiverged

  if (hasErrors) {
    let errorMessage = '\n'
    let errorDetails = '\n'
    if (context.contentModelDiverged) {
      const relevantDivergedContentTypeIds = divergedContentTypeIdsOfAffectedEntries(
        context.affectedEntities,
        context.sourceData.entries.comparables
      )

      errorMessage += `The content models of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.`
      errorDetails += `Diverged ${pluralizeContentType(
        relevantDivergedContentTypeIds.length
      )}: ${renderDivergedContentTypes(relevantDivergedContentTypeIds)}\n`
    }

    output += OutputFormatter.headline('Changeset could not be created 💔')
    output += '\n'
    output += OutputFormatter.error(errorMessage)
    output += '\n'
    output += errorDetails
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
  }

  return output
}
