import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext } from '../types'
import { doesExceedLimits } from '../../utils/exceeds-limits'
import { EntityType } from '../../types'

export const createComputeIdsTask = (entityType: EntityType): ListrTask => {
  return {
    title: `Counting number of ${entityType} changes between environments`,
    task: async (context: CreateChangesetContext) => {
      const { source, target, logger } = context
      logger.log(LogLevel.INFO, `Start computeIdsTask ${[entityType]}`)

      const added = new Set(source[entityType].ids.filter((item) => !target[entityType].ids.includes(item)))
      const removed = new Set(target[entityType].ids.filter((item) => !source[entityType].ids.includes(item)))

      const maybeChanged = target[entityType].comparables.filter((targetComparable) => {
        const sourceComparable = source[entityType].comparables.find(
          (value) => value.sys.id === targetComparable.sys.id
        )

        if (sourceComparable) {
          return targetComparable.sys.updatedAt !== sourceComparable?.sys.updatedAt
        }

        return false
      })

      context.entities[entityType].ids = { added: [...added], removed: [...removed] }
      context.entities[entityType].maybeChanged = maybeChanged

      const exceedsLimits = doesExceedLimits(context, entityType)
      context.exceedsLimits = exceedsLimits

      return Promise.resolve(context)
    },
  }
}
