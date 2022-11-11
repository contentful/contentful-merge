import {ListrTask} from 'listr2'
import {chunk} from 'lodash'
import {LogLevel} from '../../logger/types'
import {AddedChangeSetItem} from '../../types'
import {createEntity} from '../actions/create-entity'
import {ApplyChangesetContext} from '../types'

export const createAddEntitiesTask = (): ListrTask => {
  return {
    title: 'Add entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger, limit, responseCollector} = context
      logger.log(LogLevel.INFO, 'Start createAddEntitiesTask')
      const entries = changeSet.items.filter(item => item.changeType === 'added') as AddedChangeSetItem[]
      const entityCount = entries.length

      task.title = `Add ${entityCount} entities`

      const entriesChunks = chunk(entries, limit)

      let count = 0

      for (const entriesChunk of entriesChunks) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(entriesChunk.map(async item => {
          await createEntity({client, environmentId, logger, item, responseCollector, task})
          task.title = `Added ${++count}/${entityCount} entities (failed: ${responseCollector.errorsLength})`
        }))
      }
    },
  }
}
