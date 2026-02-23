export function trimInput(str?: string): Promise<string | undefined> {
  return Promise.resolve(str?.trim())
}
