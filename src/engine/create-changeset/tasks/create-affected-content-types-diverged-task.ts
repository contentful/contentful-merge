import { CreateChangesetContext } from '../types'
import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'

export function createAffectedContentTypesDivergedTask(): ListrTask {
  return {
    title: `Checking for diverged content types`,
    task: async (context: CreateChangesetContext) => {
      context.logger.log(LogLevel.INFO, `Start createAffectedContentTypesDivergedTask`)

      const affectedContentTypeIds = [
        ...context.affectedEntities.contentTypes.added,
        ...context.affectedEntities.contentTypes.removed,
        ...context.affectedEntities.contentTypes.maybeChanged.map((comparable) => comparable.sys.id),
      ]

      const affectedEntryIds = [
        ...context.affectedEntities.entries.added,
        ...context.affectedEntities.entries.maybeChanged.map((comparable) => comparable.sys.id),
      ]

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
