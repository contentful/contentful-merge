import { OutputFormatter } from './output-formatter'

export function renderErrorOutput(error: Error) {
  const errorMessage = error.message

  let output = '\n'

  output += OutputFormatter.headline('Something went wrong 💔')

  output += '\n'
  output += OutputFormatter.error(errorMessage)
  output += '\n'

  return output
}
