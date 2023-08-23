import { ApplyChangesetContext } from './types'
import { icons, pluralizeEntry, OutputFormatter, entityStatRenderer } from '../utils'

const successfulEntryChangeRenderer = entityStatRenderer({
  icon: icons.greenCheckmark,
  pluralizer: pluralizeEntry,
})

export async function renderOutput(context: ApplyChangesetContext) {
  let output = '\n'

  const { added, deleted, updated } = context.processedEntities.entries
  const amountOfChanges = added.length + deleted.length + updated.length
  output += OutputFormatter.headline('Changeset successfully applied 🎉')

  output += `\n ${icons.greenCheckmark} ${OutputFormatter.formatNumber(
    amountOfChanges
  )} changes applied in the environment "${context.environmentId}"`

  output += '\n'
  output += `\n ${successfulEntryChangeRenderer(added.length, 'added')}`
  output += `\n ${successfulEntryChangeRenderer(updated.length, 'updated')}`
  output += `\n ${successfulEntryChangeRenderer(deleted.length, 'deleted')}`

  return output
}
