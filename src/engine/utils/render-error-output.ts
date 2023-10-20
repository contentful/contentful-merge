import { AxiosError } from 'axios'
import { OutputFormatter } from './output-formatter'
import { ContentModelDivergedError, LimitsExceededForCreateError, MergeEntityError } from '../errors'
import { entityStatRenderer } from './entity-stat-renderer'
import { pluralizeContentType, pluralizeEntry } from './pluralize'
import { icons } from './icons'
import chalk from 'chalk'

const red = (text: string) => OutputFormatter.error(text)

const failedEntryChangeRenderer = entityStatRenderer({
  icon: icons.bulletPoint,
  pluralizer: pluralizeEntry,
})

function stringifyError(err: any) {
  const simpleObject: { [key: string]: any } = {}
  Object.getOwnPropertyNames(err).forEach(function (key) {
    simpleObject[key] = err[key]
  })
  return JSON.stringify(simpleObject)
}

const renderDivergedContentTypes = (contentTypeIds: string[]) => {
  return `${contentTypeIds.map((id) => chalk.italic.yellow(id)).join(', ')}`
}

export function renderErrorOutputForApply(error: Error) {
  let output = '\n'
  let errorMessage = ''

  output += OutputFormatter.headline('Merge was unsuccessful 💔')
  output += '\n'

  if (error instanceof AxiosError && error.code === 'ERR_BAD_REQUEST') {
    // TODO Add different error messages for different axios errors.
    errorMessage += 'An authorization issue occurred. Please make sure the CMA token is correct.'
  } else if (error instanceof Error) {
    errorMessage += error.message
  } else {
    try {
      const errorString = stringifyError(error)
      errorMessage += errorString
    } catch (err) {
      errorMessage += 'Unknown Error'
    }
  }

  output += OutputFormatter.error(errorMessage)

  if (error instanceof MergeEntityError) {
    const errorDetails = `\n\n${JSON.stringify(error.details, null, 2)}`
    output += red(
      `\nThe changeset was only partially applied. The merge was stopped due to the following error (entry id: ${error.entryId}):`
    )

    if (error.extra) output += red(`\n\n${error.extra}`)

    output += red(errorDetails)
  }

  return output
}

export function renderErrorOutputForCreate(error: Error) {
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
      const errorString = stringifyError(error)
      errorMessage += errorString
    } catch (err) {
      errorMessage += 'Unknown Error'
    }
  }

  output += OutputFormatter.error(errorMessage)

  if (error instanceof LimitsExceededForCreateError) {
    const entriesAddedLength = error.details.amount.added
    const entriesRemovedLength = error.details.amount.removed
    const entriesMaybeChangedLength = error.details.amount.maybeChanged
    let errorDetails = '\n'

    errorDetails += `\nDetected number of changes:`
    errorDetails += '\n'
    errorDetails += `\n  ${failedEntryChangeRenderer(entriesAddedLength, 'added')}`
    errorDetails += `\n  ${failedEntryChangeRenderer(entriesRemovedLength, 'removed')}`
    errorDetails += `\n  ${failedEntryChangeRenderer(entriesMaybeChangedLength)} to be compared`

    output += errorDetails
  }

  if (error instanceof ContentModelDivergedError) {
    let errorDetails = '\n\n'
    errorDetails += `Diverged ${pluralizeContentType(error.details.amount)}: ${renderDivergedContentTypes(
      error.divergedContentTypeIds
    )}\n`

    output += errorDetails
  }

  return output
}
