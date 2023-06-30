import { ListrTask } from 'listr2'
import * as fs from 'node:fs/promises'
import { LogLevel } from '../../logger/types'
import { ApplyChangesetContext } from '../types'

export const createLoadChangesetTask = (): ListrTask => {
  return {
    title: 'load changeset data',
    task: async (context: ApplyChangesetContext, task) => {
      task.output = `Loading data from ${context.inputPath}`
      context.logger.log(LogLevel.INFO, 'Start createLoadChangesetTask')
      context.changeset = await fs.readFile(context.inputPath, 'utf8').then((rawJson) => JSON.parse(rawJson))
    },
  }
}
