import { ListrTask } from 'listr2'
import { LogLevel } from '../../logger/types'
import { CreateChangesetContext } from '../types'
import { doesExceedLimits } from '../../utils/exceeds-limits'

export const createComputeIdsTask = (): ListrTask => {
  return {
    title: 'Counting number of changes between environments',
    task: async (context: CreateChangesetContext) => {
      const { source, target, logger } = context
      logger.log(LogLevel.INFO, 'Start computeIdsTask')

      const added = new Set(source.ids.filter((item) => !target.ids.includes(item)))
      const removed = new Set(target.ids.filter((item) => !source.ids.includes(item)))

      const maybeChanged = target.comparables.filter((targetComparable) => {
        const sourceComparable = source.comparables.find((value) => value.sys.id === targetComparable.sys.id)

        if (sourceComparable) {
          return targetComparable.sys.updatedAt !== sourceComparable?.sys.updatedAt
        }

        return false
      })

      context.ids = { added: [...added], removed: [...removed] }
      context.maybeChanged = maybeChanged

      const exceedsLimits = doesExceedLimits(context)
      context.exceedsLimits = exceedsLimits

      return Promise.resolve(context)
    },
  }
}
