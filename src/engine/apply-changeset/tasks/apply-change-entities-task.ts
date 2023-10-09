import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { LogLevel } from '../../logger/types'
import { UpdatedChangesetItem } from '../../types'
import { updateEntity } from '../actions/update-entity'
import { ApplyChangesetContext } from '../types'
import { pluralizeEntry } from '../../utils'
import { isString } from 'lodash'
import { UpdateEntryError } from '../../errors'

export const applyChangeEntitiesTask = (): ListrTask => {
  return {
    title: 'Updating entries',
    task: async (context: ApplyChangesetContext, task) => {
      const { client, changeset, environmentId, logger, responseCollector } = context
      logger.log(LogLevel.INFO, 'Start createChangeEntitiesTask')
      const items = changeset.items.filter((item) => item.changeType === 'update') as UpdatedChangesetItem[]
      const entityCount = items.length

      task.title = `Updating ${entityCount} ${pluralizeEntry(entityCount)}`

      let count = 0
      const limiter = pLimit(10)
      const result = await Promise.all(
        items.map(async (item) => {
          if (item.patch.some((i) => i.path.startsWith('/metadata'))) {
            throw new UpdateEntryError({
              id: item.entity.sys.id,
              details: { message: 'Changesets containing metadata are currently not supported' },
            })
          }

          return limiter(async () => {
            const idofUpdated = await updateEntity({ client, environmentId, logger, item, responseCollector, task })
            task.title = `Updating ${++count}/${entityCount} entries (failures: ${responseCollector.errorsLength})`

            return idofUpdated
          })
        })
      )

      const updatedEntities = result.filter(isString)

      context.processedEntities.entries.updated = updatedEntities
    },
  }
}
