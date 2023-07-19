import { CreateChangesetContext } from './types'
import { pluralizeContentType, pluralizeEntry } from '../utils/pluralize'
import { icons } from '../utils/icons'
import { entityStatRenderer } from '../utils/entity-stat-renderer'
import { OutputFormatter } from '../utils/output-formatter'
import { affectedEntitiesIds } from '../utils/affected-entities-ids'
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
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  const hasErrors = context.contentModelDiverged || context.exceedsLimits
  let divergedContentTypeIds: string[] = []

  if (hasErrors) {
    let errorMessage = '\n'
    if (context.contentModelDiverged) {
      errorMessage += `The content model of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.`
      divergedContentTypeIds = affectedEntitiesIds(context.affectedEntities.contentTypes, [
        'added',
        'removed',
        'maybeChanged',
      ])
    }

    output += OutputFormatter.headline('Changeset could not be created 💔')
    output += '\n'
    output += OutputFormatter.error(errorMessage)
    output += '\n'

    if (context.contentModelDiverged) {
      output += `\nDiverged ${pluralizeContentType(divergedContentTypeIds.length)}: ${renderDivergedContentTypes(
        divergedContentTypeIds
      )}`
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
