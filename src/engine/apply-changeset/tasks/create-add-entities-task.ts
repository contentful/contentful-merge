import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { LogLevel } from '../../logger/types'
import { AddedChangesetItem } from '../../types'
import { createEntity } from '../actions/create-entity'
import { ApplyChangesetContext } from '../types'
import { pluralizeEntry } from '../../utils'
import { isString } from 'lodash'

export const createAddEntitiesTask = (): ListrTask => {
  return {
    title: 'Adding entries',
    task: async (context: ApplyChangesetContext, task) => {
      const { client, changeset, environmentId, logger, responseCollector } = context
      logger.log(LogLevel.INFO, 'Start createAddEntitiesTask')
      const entries = changeset.items.filter((item) => item.changeType === 'add') as AddedChangesetItem[]
      const entityCount = entries.length

      task.title = `Adding ${entityCount} ${pluralizeEntry(entityCount)}`

      let count = 0

      const limiter = pLimit(10)

      const result = await Promise.all(
        entries.map(async (item) => {
          return limiter(async () => {
            const idOfAdded = await createEntity({ client, environmentId, logger, item, responseCollector, task })
            task.title = `Adding ${++count}/${entityCount} entries (failures: ${responseCollector.errorsLength})`

            return idOfAdded
          })
        })
      )

      const addedEntities = result.filter(isString)

      context.processedEntities.entries.added = addedEntities
    },
  }
}
