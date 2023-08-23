export function renderFilePaths({ changesetPath, logFilePath }: { changesetPath?: string; logFilePath?: string }) {
  let output = ''

  if (changesetPath) {
    output += `\n💾 ${changesetPath}`
  }
  if (logFilePath) {
    output += `\n📖 ${logFilePath}`
  }

  return output
}
