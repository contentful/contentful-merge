import { OutputFormatter } from './output-formatter'

export function renderErrorOutput(error: Error) {
  const errorMessage = error.message

  let output = '\n'

  output += OutputFormatter.headline('Changeset could not be created 💔')

  output += '\n'
  output += OutputFormatter.error(errorMessage)
  output += '\n'

  return output
}
