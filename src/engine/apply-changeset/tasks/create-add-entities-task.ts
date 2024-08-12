import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { AddedChangesetItem } from '../../types'
import { createEntity } from '../actions/create-entity'
import { ApplyChangesetContext } from '../types'
import { pluralizeEntry } from '../../utils'
import { isString } from 'lodash'
import { publishEntity } from '../actions/publish-entity'
import sortEntries from '../../utils/sort-entries-by-reference'

export const createAddEntitiesTask = (): ListrTask => {
  return {
    title: 'Adding entries',
    task: async (context: ApplyChangesetContext, task) => {
      const { client, changeset, environmentId, logger, responseCollector } = context
      logger.info('Start createAddEntitiesTask')
      const entries = sortEntries(changeset.items.filter((item) => item.changeType === 'add') as AddedChangesetItem[])
      const entityCount = entries.length

      task.title = `Adding ${entityCount} ${pluralizeEntry(entityCount)}`

      let count = 0

      const limiter = pLimit(10)

      const result = await Promise.all(
        entries.map(async (item) => {
          return limiter(async () => {
            const createdEntry = await createEntity({ client, environmentId, logger, item, responseCollector, task })
            task.title = `Adding ${++count}/${entityCount} entries`

            await publishEntity({ client, entity: createdEntry, environmentId, logger, responseCollector, task })

            return createdEntry.sys.id
          })
        }),
      )

      const addedEntities = result.filter(isString)

      context.processedEntities.entries.added = addedEntities
    },
  }
}
