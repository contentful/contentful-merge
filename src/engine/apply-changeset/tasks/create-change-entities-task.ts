import {ListrTask} from 'listr2'
import pLimit from 'p-limit'
import {LogLevel} from '../../logger/types'
import {ChangedChangeSetItem} from '../../types'
import {updateEntity} from '../actions/update-entity'
import {ApplyChangesetContext} from '../types'

export const createChangeEntitiesTask = (): ListrTask => {
  return {
    title: 'Change entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger, responseCollector} = context
      logger.log(LogLevel.INFO, 'Start createChangeEntitiesTask')
      const items = changeSet.items.filter(item => item.changeType === 'changed') as ChangedChangeSetItem[]
      const entityCount = items.length

      task.title = `Change ${entityCount} entities`

      let count = 0
      const limiter = pLimit(10)

      await Promise.all(items.map(async item => {
        return limiter(async () => {
          await updateEntity({client, environmentId, logger, item, responseCollector, task})
          task.title = `Changed ${++count}/${entityCount} entities (failed: ${responseCollector.errorsLength})`
        })
      }),
      )
    },
  }
}
