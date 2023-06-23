import { CreateChangesetContext } from '../create-changeset/types'

export const doesExceedLimits = (context: CreateChangesetContext) => {
  const numberOfAdded = context.ids.added.length
  const numberOfRemoved = context.ids.removed.length
  const numberOfMaybeChanged = context.maybeChanged.length

  return (
    numberOfAdded + numberOfRemoved + numberOfMaybeChanged > context.limits.all ||
    numberOfAdded > context.limits.added ||
    numberOfRemoved > context.limits.removed ||
    numberOfMaybeChanged > context.limits.changed
  )
}
