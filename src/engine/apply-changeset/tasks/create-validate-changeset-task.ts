import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { changesetExceedsLimits } from '../../validations/exceeds-limits'
import { LimitsExceededForApplyError, LocaleMissingForApplyError } from '../../errors'
import { containsMetadata } from '../../validations/contains-metadata'

async function validateLocales(context: ApplyChangesetContext) {
  const sourceEnvironmentId = context.changeset.sys.source.sys.id

  const [sourceLocales, targetLocales] = await Promise.all([
    context.client.cma.locales.getMany({ environment: sourceEnvironmentId }),
    context.client.cma.locales.getMany({ environment: context.environmentId }),
  ])

  if (sourceLocales.items.length !== targetLocales.items.length) {
    return false
  }

  const sourceLocaleCodes = sourceLocales.items.map((locale) => locale.code)
  const targetLocaleCodes = targetLocales.items.map((locale) => locale.code)

  return sourceLocaleCodes.every((code) => targetLocaleCodes.includes(code))
}

export const createValidateChangesetTask = (): ListrTask => {
  return {
    title: `Validating changeset`,
    task: async (context: ApplyChangesetContext) => {
      const exceedsLimits = changesetExceedsLimits(context)

      // We are only enforcing limits for entries atm as we do not create changesets for content types
      if (exceedsLimits) {
        throw new LimitsExceededForApplyError(context)
      }

      const areLocalesInSynch = await validateLocales(context)

      if (!areLocalesInSynch) {
        throw new LocaleMissingForApplyError(context)
      }

      containsMetadata(context)

      return Promise.resolve(context)
    },
  }
}
