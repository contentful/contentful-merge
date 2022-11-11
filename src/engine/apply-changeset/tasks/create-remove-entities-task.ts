import {ListrTask} from 'listr2'
import {chunk} from 'lodash'
import {LogLevel} from '../../logger/types'
import {deleteEntity} from '../actions/delete-entity'
import {updateEntity} from '../actions/update-entity'
import {ApplyChangesetContext} from '../types'

export const createRemoveEntitiesTask = (): ListrTask => {
  return {
    title: 'Delete entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger, limit, responseCollector} = context
      logger.log(LogLevel.INFO, 'Start createRemoveEntitiesTask')
      const ids = changeSet.items.filter(item => item.changeType === 'deleted').map(item => item.entity.sys.id)
      const entityCount = ids.length

      task.title = `Delete ${entityCount} entities`

      let count = 0

      const entriesChunks = chunk(ids, limit)

      for (const entriesChunk of entriesChunks) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(entriesChunk.map(async id => {
          await deleteEntity({client, environmentId, logger, id, responseCollector, task})
          task.title = `Deleted ${++count}/${entityCount} entities (failed: ${responseCollector.errorsLength})`
        }))
      }
    },
  }
}
