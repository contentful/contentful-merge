import { Entry } from 'contentful'
import { ListrTask } from 'listr2'
import { chunk, pick } from 'lodash'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext } from '../types'
import { pluralizeEntry } from '../../utils/pluralize'
import { EntityType } from '../../types'

export function cleanEntity(entry: Entry<any>): any {
  return { ...entry, sys: pick(entry.sys, ['id', 'type', 'contentType']) }
}

type FetchAddedEntitiesTaskProps = {
  entityType: EntityType
}

export function createFetchAddedEntitiesTask({ entityType }: FetchAddedEntitiesTaskProps): ListrTask {
  return {
    title: 'Fetching full payload for added entries',
    task: async (context: CreateChangesetContext, task) => {
      const { client, affectedEntities, sourceEnvironmentId, changeset, limit, logger } = context
      logger.log(LogLevel.INFO, 'Start createFetchAddedEntitiesTask')

      const {
        [entityType]: { added },
      } = affectedEntities

      task.title = `Fetching full payload for ${added.length} added ${pluralizeEntry(added.length)}`

      // TODO: use pLimit
      const idChunks = chunk(added, limit)
      let iterator = 0

      for (const chunk of idChunks) {
        task.output = `Fetching ${limit} entities ${++iterator * limit}/${added.length}`
        const query = { 'sys.id[in]': chunk.join(','), locale: '*', limit }
        // eslint-disable-next-line no-await-in-loop
        const entries = await client.cda.entries
          .getMany({
            environment: sourceEnvironmentId,
            query,
          })
          .then((response) => response.items)

        for (const entry of entries) {
          const item = changeset.items.find((item) => item.entity.sys.id === entry.sys.id)
          if (item && item.changeType === 'add') {
            item.data = cleanEntity(entry)
          }
        }
      }
    },
  }
}
