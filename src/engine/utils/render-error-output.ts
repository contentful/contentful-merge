import { AxiosError } from 'axios'
import { OutputFormatter } from './output-formatter'
import { LimitsExceededError } from '../create-changeset/errors'
import { entityStatRenderer } from './entity-stat-renderer'
import { pluralizeEntry } from './pluralize'
import { icons } from './icons'

const failedEntryChangeRenderer = entityStatRenderer({
  icon: icons.bulletPoint,
  pluralizer: pluralizeEntry,
})

export function renderErrorOutput(error: Error) {
  let output = '\n'
  let errorMessage = ''

  output += OutputFormatter.headline('Changeset could not be created 💔')
  output += '\n'

  if (error instanceof AxiosError && error.code === 'ERR_BAD_REQUEST') {
    // TODO Add different error messages for different axios errors.
    errorMessage +=
      'An authorisation issue occurred. Please make sure the API key you provided has access to both environments.'
  } else if (error instanceof Error) {
    errorMessage += error.message
  } else {
    try {
      const errorString = String(error)
      errorMessage += errorString
    } catch (err) {
      errorMessage += 'Unknown Error'
    }
  }

  output += OutputFormatter.error(errorMessage)

  if (error instanceof LimitsExceededError) {
    const entriesAddedLength = error.context.affectedEntities.entries.added.length
    const entriesRemovedLength = error.context.affectedEntities.entries.removed.length
    const entriesMaybeChangedLength = error.context.affectedEntities.entries.maybeChanged.length

    output += '\n'
    output += `\nDetected number of changes:`
    output += '\n'
    output += `\n  ${failedEntryChangeRenderer(entriesAddedLength, 'added')}`
    output += `\n  ${failedEntryChangeRenderer(entriesRemovedLength, 'removed')}`
    output += `\n  ${failedEntryChangeRenderer(entriesMaybeChangedLength)} to be compared`
  }

  return output
}
