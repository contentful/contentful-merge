import { CreateChangesetContext } from './types'
import { icons, pluralizeEntry, OutputFormatter, entityStatRenderer } from '../utils'

const successfulEntryChangeRenderer = entityStatRenderer({
  icon: icons.greenCheckmark,
  pluralizer: pluralizeEntry,
})

export async function renderOutput(context: CreateChangesetContext) {
  let output = '\n'
  const sourceEntriesLength = context.sourceData.entries.ids.length
  const targetEntriesLength = context.targetData.entries.ids.length

  output += OutputFormatter.headline('Changeset successfully created 🎉')

  output += `\n  ${successfulEntryChangeRenderer(sourceEntriesLength)} detected in the source environment "${
    context.sourceEnvironmentId
  }"`
  output += `\n  ${successfulEntryChangeRenderer(targetEntriesLength)} detected in the target environment "${
    context.targetEnvironmentId
  }"`
  output += '\n'
  output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.added, 'added')}`
  output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.changed, 'updated')}`
  output += `\n  ${successfulEntryChangeRenderer(context.statistics.entries.removed, 'deleted')}`

  return output
}
