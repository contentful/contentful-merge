import { CreateChangesetContext } from '../create-changeset/types'
import { EntityType } from '../types'

export const doesExceedLimits = (context: CreateChangesetContext, entityType: EntityType) => {
  const numberOfAdded = context.entities[entityType].ids.added.length
  const numberOfRemoved = context.entities[entityType].ids.removed.length
  const numberOfMaybeChanged = context.entities[entityType].maybeChanged.length

  return (
    numberOfAdded + numberOfRemoved + numberOfMaybeChanged > context.limits.all ||
    numberOfAdded > context.limits.added ||
    numberOfRemoved > context.limits.removed ||
    numberOfMaybeChanged > context.limits.changed
  )
}
