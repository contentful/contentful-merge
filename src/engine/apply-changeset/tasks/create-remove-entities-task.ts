import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { LogLevel } from '../../logger/types'
import { deleteEntity } from '../actions/delete-entity'
import { ApplyChangesetContext } from '../types'

export const createRemoveEntitiesTask = (): ListrTask => {
  return {
    title: 'Delete entities',
    task: async (context: ApplyChangesetContext, task) => {
      const { client, changeset, environmentId, logger, responseCollector } = context
      logger.log(LogLevel.INFO, 'Start createRemoveEntitiesTask')
      const ids = changeset.items.filter((item) => item.changeType === 'delete').map((item) => item.entity.sys.id)
      const entityCount = ids.length

      task.title = `Delete ${entityCount} entities`

      let count = 0

      const limiter = pLimit(10)

      await Promise.all(
        ids.map(async (id) => {
          return limiter(async () => {
            await deleteEntity({ client, environmentId, logger, id, responseCollector, task })
            task.title = `Deleted ${++count}/${entityCount} entities (failed: ${responseCollector.errorsLength})`
          })
        })
      )
    },
  }
}
