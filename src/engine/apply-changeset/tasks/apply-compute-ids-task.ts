import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { changegestExceedLimits } from '../../utils/exceeds-limits'
import { EntityType } from '../../types'
import { LimitsExceededForApplyError } from '../../errors'

type ComputeIdsTaskProps = {
  entityType: EntityType
}

export const applyComputeIdsTask = (): ListrTask => {
  return {
    title: `Counting number of changes between environments`,
    task: async (context: ApplyChangesetContext) => {
      const exceedsLimits = changegestExceedLimits(context)

      // We are only enforcing limits for entries atm as we do not create changesets for content types
      if (exceedsLimits) {
        throw new LimitsExceededForApplyError(context)
      }

      return Promise.resolve(context)
    },
  }
}
