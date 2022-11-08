import {ListrTask} from 'listr2'
import {LogLevel} from '../../logger/types'
import {ApplyChangesetContext} from '../types'

export const createRemoveEntitiesTask = (): ListrTask => {
  return {
    title: 'Delete entities',
    task: async (context: ApplyChangesetContext, task) => {
      const {client, changeSet, environmentId, logger} = context
      logger.log(LogLevel.INFO, 'Start createRemoveEntitiesTask')
      const ids = changeSet.items.filter(item => item.changeType === 'deleted').map(item => item.entity.sys.id)
      const entityCount = ids.length

      task.title = `Delete ${entityCount} entities`

      let counter = 0

      for (const id of ids) {
        task.output = `deleting entity ${++counter}/${entityCount}`

        if (counter > 2) {
          return
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          const serverEntity = await client.cma.entries.get({entryId: id, environment: environmentId})
          if (!serverEntity) {
            continue
          }

          // eslint-disable-next-line no-await-in-loop
          await client.cma.entries.unpublish({
            environment: environmentId,
            entryId: id,
          })

          // eslint-disable-next-line no-await-in-loop
          await client.cma.entries.delete({
            environment: environmentId,
            entryId: id,
          })

          logger.log(LogLevel.INFO, `entry ${id} successfully deleted`)
        } catch (error: any) {
          task.output = error.toString()
          logger.log(LogLevel.ERROR, error)
        }
      }
    },
  }
}
