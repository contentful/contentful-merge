import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { deleteEntity } from '../actions/delete-entity'
import { ApplyChangesetContext } from '../types'
import { pluralizeEntry } from '../../utils'
import { isString } from 'lodash'

export const createRemoveEntitiesTask = (): ListrTask => {
  return {
    title: 'Deleting entries',
    task: async (context: ApplyChangesetContext, task) => {
      const { client, changeset, environmentId, logger, responseCollector } = context
      logger.info('Start createRemoveEntitiesTask')
      const ids = changeset.items.filter((item) => item.changeType === 'delete').map((item) => item.entity.sys.id)
      const entityCount = ids.length

      task.title = `Deleting ${entityCount} ${pluralizeEntry(entityCount)}`

      let count = 0

      const limiter = pLimit(10)

      const result = await Promise.all(
        ids.map(async (id) => {
          return limiter(async () => {
            const idOfDeleted = await deleteEntity({ client, environmentId, logger, id, responseCollector, task })
            task.title = `Deleting ${++count}/${entityCount} entries`

            return idOfDeleted
          })
        })
      )

      const deletedEntities = result.filter(isString)

      context.processedEntities.entries.deleted = deletedEntities
    },
  }
}
