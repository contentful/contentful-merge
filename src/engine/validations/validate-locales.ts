import { ApplyChangesetContext } from '../apply-changeset/types'
import { AuthorizationErrorForApply, ContentfulError } from '../errors'

export async function validateLocales(context: ApplyChangesetContext) {
  const sourceEnvironmentId = context.changeset.sys.source.sys.id
  let sourceLocales, targetLocales

  try {
    ;[sourceLocales, targetLocales] = await Promise.all([
      context.client.cma.locales.getMany({ environment: sourceEnvironmentId }),
      context.client.cma.locales.getMany({ environment: context.environmentId }),
    ])
  } catch (err: any) {
    context.responseCollector.add(err.code, err)

    if (err.response?.status === 401) {
      throw new AuthorizationErrorForApply(context, { originalError: err.data })
    }
    throw new ContentfulError('Unexpected error has ocurred', { originalError: err.data, context })
  }

  if (sourceLocales.items.length !== targetLocales.items.length) {
    return false
  }

  const sourceLocaleCodes = sourceLocales.items.map((locale) => locale.code)
  const targetLocaleCodes = targetLocales.items.map((locale) => locale.code)

  return sourceLocaleCodes.every((code) => targetLocaleCodes.includes(code))
}
