import { CreateChangesetContext } from '../types'
import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'

export function createContentTypesDivergedTask(): ListrTask {
  return {
    title: `Checking for diverged Content Types`,
    task: async (context: CreateChangesetContext, task) => {
      context.logger.log(LogLevel.INFO, `Start createContentTypesDivergedTask`)

      if (
        context.affectedEntities.contentTypes.added.length > 0 ||
        context.affectedEntities.contentTypes.removed.length > 0 ||
        context.affectedEntities.contentTypes.maybeChanged.length > 0
      ) {
        context.contentModelDiverged = true
      }

      return context
    },
  }
}
