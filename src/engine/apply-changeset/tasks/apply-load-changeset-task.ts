import { ListrTask } from 'listr2'
import * as fs from 'node:fs/promises'
import { LogLevel } from '../../logger/types'
import { ApplyChangesetContext } from '../types'
import { ChangesetFileError } from '../../errors'

export const applyLoadChangesetTask = (): ListrTask => {
  return {
    title: 'Load changeset data',
    task: async (context: ApplyChangesetContext, task) => {
      task.output = `Loading data from ${context.inputPath}`
      context.logger.log(LogLevel.INFO, 'Start createLoadChangesetTask')

      try {
        const changeset = await fs.readFile(context.inputPath, 'utf8').then((rawJson) => JSON.parse(rawJson))
        context.changeset = changeset
      } catch (error: any) {
        context.logger.log(LogLevel.ERROR, `reading changeset file: ${error}`)
        if (error.code === 'ENOENT') {
          throw new ChangesetFileError(error.path)
        } else {
          throw error
        }
      }
    },
  }
}
