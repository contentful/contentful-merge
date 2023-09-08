import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { changesetExceedsLimits } from '../../utils/exceeds-limits'
import { LimitsExceededForApplyError } from '../../errors'

export const applyComputeIdsTask = (): ListrTask => {
  return {
    title: `Counting number of changes between environments`,
    task: async (context: ApplyChangesetContext) => {
      const exceedsLimits = changesetExceedsLimits(context)

      // We are only enforcing limits for entries atm as we do not create changesets for content types
      if (exceedsLimits) {
        throw new LimitsExceededForApplyError(context)
      }

      return Promise.resolve(context)
    },
  }
}
