import { CreateChangesetContext } from '../types'
import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { affectedEntitiesIds } from '../../utils/affected-entities-ids'

export function createAffectedContentTypesDivergedTask(): ListrTask {
  return {
    title: `Checking for diverged content types`,
    task: async (context: CreateChangesetContext) => {
      context.logger.log(LogLevel.INFO, `Start createAffectedContentTypesDivergedTask`)

      const affectedContentTypeIds = affectedEntitiesIds(context.affectedEntities.contentTypes, [
        'added',
        'removed',
        'maybeChanged',
      ])
      const affectedEntryIds = affectedEntitiesIds(context.affectedEntities.entries, ['added', 'maybeChanged'])

      const contentTypeIdsOfAffectedEntries = [
        ...new Set<string>(
          context.targetData.entries.comparables
            .filter((comparable) => affectedEntryIds.includes(comparable.sys.id))
            .map((comparable) => comparable.sys.contentType!.sys.id)
        ),
      ]

      const contentModelDiverged = contentTypeIdsOfAffectedEntries.filter((id) => affectedContentTypeIds.includes(id))

      if (contentModelDiverged.length) {
        context.contentModelDiverged = true
      }

      return context
    },
  }
}
