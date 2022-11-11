import {ListrTask} from 'listr2'
import {chunk} from 'lodash'
import {LogLevel} from '../../logger/types'
import {ChangedChangeSetItem} from '../../types'
import {updateEntity} from '../actions/update-entity'
import {ApplyChangesetContext} from '../types'

export const createChangeEntitiesTask = (): ListrTask => {
  return {
    title: 'Delete entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger, limit, responseCollector} = context
      logger.log(LogLevel.INFO, 'Start createChangeEntitiesTask')
      const items = changeSet.items.filter(item => item.changeType === 'changed') as ChangedChangeSetItem[]
      const entityCount = items.length

      task.title = `Change ${entityCount} entities`

      const entriesChunks = chunk(items, limit)

      let count = 0

      for (const entriesChunk of entriesChunks) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(entriesChunk.map(async item => {
          await updateEntity({client, environmentId, logger, item, responseCollector, task})
          task.title = `Changed ${++count}/${entityCount} entities (failed: ${responseCollector.errorsLength})`
        }))
      }
    },
  }
}
