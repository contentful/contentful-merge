import {ListrTask} from 'listr2'
import {LogLevel} from '../../logger/types'
import {CreateChangesetContext} from '../types'

export const createComputeIdsTask = (): ListrTask => {
  return {
    task: async (context: CreateChangesetContext) => {
      const {source, target, logger} = context
      logger.log(LogLevel.INFO, 'Start createFetchAddedEntitiesTask')

      const added = new Set(source.ids.filter(item => !target.ids.includes(item)))
      const removed = new Set(target.ids.filter(item => !source.ids.includes(item)))

      const changed = target.comparables.filter(targetComparable => {
        const sourceComparable = source.comparables.find(value => value.sys.id === targetComparable.sys.id)

        if (sourceComparable) {
          return targetComparable.sys.updatedAt !== sourceComparable?.sys.updatedAt
        }

        return false
      })

      context.ids = {added: [...added], removed: [...removed]}
      context.changed = changed

      return Promise.resolve(context)
    },
  }
}
