import * as fs from 'node:fs/promises'
import { ChangesetFileError } from '../errors'

export const loadChangeset = async (path: string) => {
  try {
    const changeset = await fs.readFile(path, 'utf8').then((rawJson) => JSON.parse(rawJson))
    return changeset
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new ChangesetFileError(error.path)
    } else {
      throw error
    }
  }
}
