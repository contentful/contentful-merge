export function renderFilePaths(changesetFilePath: string | undefined, logFilePath: string | undefined) {
  let output = '\n'

  if (changesetFilePath) {
    output += `\n💾 ${changesetFilePath}`
  }
  if (logFilePath) {
    output += `\n📖 ${logFilePath}`
  }

  return output
}
