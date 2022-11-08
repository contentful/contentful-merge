import {ListrTask} from 'listr2'
import {LogLevel} from '../../logger/types'
import {CreateChangesetContext} from '../types'

export const createComputeIdsTask = ():ListrTask => {
  return {
    task: async (context: CreateChangesetContext) => {
      const {source, target, logger} = context
      logger.log(LogLevel.INFO, 'Start createFetchAddedEntitiesTask')

      const added = new Set(source.ids.filter(item => !target.ids.includes(item)))
      const removed = new Set(target.ids.filter(item => !source.ids.includes(item)))
      const changed = target.comparables.filter(item => {
        const {id, updatedAt} = item.sys
        if (added.has(id) || removed.has(id)) {
          return false
        }

        return updatedAt !== source.comparables.find(value => value.sys.id === id)?.sys.updatedAt
      })

      context.ids = {added: [...added], removed: [...removed]}
      context.changed = changed

      return Promise.resolve(context)
    },
  }
}
