import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { ApplyChangesetContext } from '../types'
import { loadChangeset } from '../load-changeset'

export const createLoadChangesetTask = (): ListrTask => {
  return {
    title: 'Load changeset data',
    task: async (context: ApplyChangesetContext, task) => {
      task.output = `Loading data from ${context.inputPath}`
      context.logger.log(LogLevel.INFO, 'Start createLoadChangesetTask')

      const changeset = await loadChangeset(context.inputPath)
      context.changeset = changeset
    },
  }
}
