import { CreateChangesetContext } from '../create-changeset/types'

export function exceedsLimitsForType(
  type: keyof Omit<CreateChangesetContext['limits'], 'all'>,
  context: CreateChangesetContext
): boolean {
  if (type === 'changed') {
    return context.changed.length >= Math.min(context.limits.all, context.limits.changed)
  }
  return context.ids[type].length >= Math.min(context.limits.all, context.limits[type])
}
