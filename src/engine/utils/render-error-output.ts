import { OutputFormatter } from './output-formatter'

type Config = {
  changesetFilePath?: string
  logFilePath?: string
}

export function renderErrorOutput(error: Error, config: Config) {
  const errorMessage = error.message

  let output = '\n'

  output += OutputFormatter.headline('Changeset could not be created 💔')

  output += '\n'
  output += OutputFormatter.error(errorMessage)
  output += '\n'

  if (config.changesetFilePath) {
    output += `\n💾 ${config.changesetFilePath}`
  }
  if (config.logFilePath) {
    output += `\n📖 ${config.logFilePath}`
  }

  return output
}
