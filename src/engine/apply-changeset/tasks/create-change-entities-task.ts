import jsonpatch from 'fast-json-patch'
import {ListrTask} from 'listr2'
import {LogLevel} from '../../logger/types'
import {ChangedChangeSetItem} from '../../types'
import {ApplyChangesetContext} from '../types'

export const createChangeEntitiesTask = (): ListrTask => {
  return {
    title: 'Delete entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger} = context
      logger.log(LogLevel.INFO, 'Start createChangeEntitiesTask')
      const items = changeSet.items.filter(item => item.changeType === 'changed') as ChangedChangeSetItem[]
      const entityCount = items.length

      task.title = `Change ${entityCount} entities`

      let counter = 0

      for (const item of items) {
        task.output = `Changing entity ${++counter}/${entityCount}`

        try {
          // eslint-disable-next-line no-await-in-loop
          const serverEntity = await client.cma.entries.get({entryId: item.entity.sys.id, environment: environmentId})
          if (!serverEntity) {
            continue
          }

          const patch = item.patch

          const patchEntry = jsonpatch.applyPatch(serverEntity, patch).newDocument

          // eslint-disable-next-line no-await-in-loop
          const updatedEntry = await client.cma.entries.update({
            environment: environmentId,
            entryId: item.entity.sys.id,
            contentType: patchEntry.sys.contentType.sys.id,
            entry: patchEntry,
          })

          // eslint-disable-next-line no-await-in-loop
          await client.cma.entries.publish({
            environment: environmentId,
            entryId: updatedEntry.sys.id,
            entry: updatedEntry,
          })

          logger.log(LogLevel.INFO, `entry ${item.entity.sys.id} successfully updated`)
        } catch (error: any) {
          task.output = error.toString()
          logger.log(LogLevel.ERROR, `createChangeEntitiesTask ${error}`)
        }
      }
    },
  }
}
