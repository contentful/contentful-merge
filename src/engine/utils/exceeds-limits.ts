import { ApplyChangesetContext } from '../apply-changeset/types'
import { CreateChangesetContext } from '../create-changeset/types'
import { EntityType } from '../types'

export const doesExceedLimits = (context: CreateChangesetContext, entityType: EntityType) => {
  const numberOfAdded = context.affectedEntities[entityType].added.length
  const numberOfRemoved = context.affectedEntities[entityType].removed.length
  const numberOfMaybeChanged = context.affectedEntities[entityType].maybeChanged.length

  return (
    numberOfAdded + numberOfRemoved + numberOfMaybeChanged > context.limits.all ||
    numberOfAdded > context.limits.added ||
    numberOfRemoved > context.limits.removed ||
    numberOfMaybeChanged > context.limits.changed
  )
}

export const changesetExceedsLimits = (context: ApplyChangesetContext) => {
  return context.changeset.items.length > context.limit
}
