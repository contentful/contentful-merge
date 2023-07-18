import { Entry } from 'contentful'
import { ListrTask } from 'listr2'
import { chunk, pick } from 'lodash'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext, SkipHandler } from '../types'
import { pluralizeEntry } from '../../utils/pluralize'
import { EntityType } from '../../types'
import { createScopedLogger } from '../../logger/create-scoped-logger'

export function cleanEntity(entry: Entry<any>): any {
  return { ...entry, sys: pick(entry.sys, ['id', 'type', 'contentType']) }
}

type FetchAddedEntitiesTaskProps = {
  entityType: EntityType
  skipHandler: SkipHandler
}

export function createFetchAddedEntitiesTask({ entityType, skipHandler }: FetchAddedEntitiesTaskProps): ListrTask {
  return {
    title: 'Fetching full payload for added entries',
    skip: skipHandler,
    task: async (context: CreateChangesetContext, task) => {
      const { client, affectedEntities, sourceEnvironmentId, changeset, limit } = context
      const logger = createScopedLogger(context.logger, `CreateFetchAddedEntitiesTask '${entityType}'`)
      logger.startScope()

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
          .getMany(
            {
              environment: sourceEnvironmentId,
              query,
            },
            logger
          )
          .then((response) => response.items)

        for (const entry of entries) {
          const item = changeset.items.find((item) => item.entity.sys.id === entry.sys.id)
          if (item && item.changeType === 'added') {
            item.data = cleanEntity(entry)
          }
        }
      }
      logger.startScope()
      return context
    },
  }
}
