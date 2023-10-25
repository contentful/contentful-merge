import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { loadChangeset } from '../load-changeset'

export const createLoadChangesetTask = (): ListrTask => {
  return {
    title: 'Load changeset data',
    task: async (context: ApplyChangesetContext, task) => {
      task.output = `Loading data from ${context.inputPath}`
      context.logger.info('Start createLoadChangesetTask')
      context.changeset = await loadChangeset(context.inputPath)
    },
  }
}
