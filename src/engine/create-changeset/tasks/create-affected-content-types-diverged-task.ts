import { CreateChangesetContext } from '../types'
import { ListrTask } from 'listr2'
import { divergedContentTypeIdsOfAffectedEntries } from '../../utils'
import { ContentModelDivergedError } from '../../errors'

export function createAffectedContentTypesDivergedTask(): ListrTask {
  return {
    title: `Checking for diverged content types`,
    task: async (context: CreateChangesetContext) => {
      context.logger.info(`Start affectedContentTypesDivergedTask`)

      const relevantDivergedContentTypeIds = divergedContentTypeIdsOfAffectedEntries(
        context.affectedEntities,
        context.sourceData.entries.comparables
      )

      if (relevantDivergedContentTypeIds.length) {
        throw new ContentModelDivergedError(relevantDivergedContentTypeIds)
      }

      return context
    },
  }
}
