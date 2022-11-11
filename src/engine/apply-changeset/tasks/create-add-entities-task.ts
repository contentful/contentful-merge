import {EntryProps} from 'contentful-management'
import {ListrTask} from 'listr2'
import {omit} from 'lodash'
import {LogLevel} from '../../logger/types'
import {AddedChangeSetItem} from '../../types'
import {ApplyChangesetContext} from '../types'

export const createAddEntitiesTask = (): ListrTask => {
  return {
    title: 'Add entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger} = context
      logger.log(LogLevel.INFO, 'Start createAddEntitiesTask')
      const entries = changeSet.items.filter(item => item.changeType === 'added') as AddedChangeSetItem[]
      const entityCount = entries.length

      task.title = `Add ${entityCount} entities`

      let counter = 0

      for (const entry of entries) {
        task.output = `adding entity ${++counter}/${entityCount}`

        try {
          // eslint-disable-next-line no-await-in-loop
          const createdEntry = await client.cma.entries.create({
            environment: environmentId,
            entryId: entry.entity.sys.id,
            entry: omit(entry.data as EntryProps, ['sys']),
            contentType: (entry.data as EntryProps).sys.contentType.sys.id,
          })

          // eslint-disable-next-line no-await-in-loop
          await client.cma.entries.publish({
            environment: environmentId,
            entryId: createdEntry.sys.id,
            entry: createdEntry,
          })

          logger.log(LogLevel.INFO, `entry ${entry.entity.sys.id} successfully published`)
        } catch (error: any) {
          task.output = error.toString()
          logger.log(LogLevel.ERROR, `createAddEntitiesTask ${error}`)
        }
      }
    },
  }
}
