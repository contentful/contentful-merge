import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext } from '../types'
import { doesExceedLimits } from '../../utils/exceeds-limits'
import { EntityType } from '../../types'

export const createComputeIdsTask = (entityType: EntityType): ListrTask => {
  return {
    title: `Counting number of ${entityType} changes between environments`,
    task: async (context: CreateChangesetContext) => {
      const { sourceData, targetData, logger } = context
      logger.log(LogLevel.INFO, `Start computeIdsTask ${[entityType]}`)

      const added = new Set(sourceData[entityType].ids.filter((item) => !targetData[entityType].ids.includes(item)))
      const removed = new Set(targetData[entityType].ids.filter((item) => !sourceData[entityType].ids.includes(item)))

      const maybeChanged = targetData[entityType].comparables.filter((targetComparable) => {
        const sourceComparable = sourceData[entityType].comparables.find(
          (value) => value.sys.id === targetComparable.sys.id
        )

        if (sourceComparable) {
          return targetComparable.sys.updatedAt !== sourceComparable?.sys.updatedAt
        }

        return false
      })

      context.affectedEntities[entityType] = { added: [...added], removed: [...removed], maybeChanged }

      const exceedsLimits = doesExceedLimits(context, entityType)
      context.exceedsLimits = exceedsLimits

      return Promise.resolve(context)
    },
  }
}
