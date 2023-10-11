import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { changesetExceedsLimits } from '../../validations/exceeds-limits'
import { LimitsExceededForApplyError } from '../../errors'
import { containsMetadata } from '../../validations/contains-metadata'

export const createValidateChangesetTask = (): ListrTask => {
  return {
    title: `Validating changeset`,
    task: async (context: ApplyChangesetContext) => {
      const exceedsLimits = changesetExceedsLimits(context)

      // We are only enforcing limits for entries atm as we do not create changesets for content types
      if (exceedsLimits) {
        throw new LimitsExceededForApplyError(context)
      }

      containsMetadata(context)

      return Promise.resolve(context)
    },
  }
}
