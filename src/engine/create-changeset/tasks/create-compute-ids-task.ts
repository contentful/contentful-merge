import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext, EnvironmentScope } from '../types'
import { doesExceedLimits } from '../../utils/exceeds-limits'
import { EntityType } from '../../types'
import { createScopedLogger } from '../../logger/create-scoped-logger'
type ComputeIdsTaskProps = {
  entityType: EntityType
}

export const createComputeIdsTask = ({ entityType }: ComputeIdsTaskProps): ListrTask => {
  return {
    title: `Counting number of ${entityType} changes between environments`,
    task: async (context: CreateChangesetContext) => {
      const { sourceData, targetData } = context
      const logger = createScopedLogger(context.logger, `CreateComputeIdsTask '${entityType}'`)
      logger.startScope()

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
      logger.stopScope()
      return Promise.resolve(context)
    },
  }
}
