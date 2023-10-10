import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext } from '../types'
import { doesExceedLimits } from '../../validations/exceeds-limits'
import { EntityType } from '../../types'
import { LimitsExceededForCreateError } from '../../errors'

type ComputeIdsTaskProps = {
  entityType: EntityType
}

export const computeIdsTask = ({ entityType }: ComputeIdsTaskProps): ListrTask => {
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

      context.affectedEntities[entityType] = { added: [...added], removed: [...removed], maybeChanged, changed: [] }

      const exceedsLimits = doesExceedLimits(context, entityType)

      // We are only enforcing limits for entries atm as we do not create changesets for content types
      if (exceedsLimits && entityType == 'entries') {
        throw new LimitsExceededForCreateError({
          limit: context.limits.all,
          affectedEntities: context.affectedEntities,
        })
      }

      return Promise.resolve(context)
    },
  }
}
