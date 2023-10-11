export function parseStringAsBoolean(str: string) {
  const lowerCasedStr = str.toLowerCase()
  return lowerCasedStr === 'true'
}
