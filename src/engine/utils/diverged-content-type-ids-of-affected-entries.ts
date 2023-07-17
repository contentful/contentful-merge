import type { AffectedEntityData, Comparable } from '../create-changeset/types'
import { EntityType } from '../types'
import { affectedEntitiesIds } from './affected-entities-ids'

// Calculates the ids of diverged content types only for affected entries
export function divergedContentTypeIdsOfAffectedEntries(
  affectedEntities: Record<EntityType, AffectedEntityData>,
  entryComparables: Comparable[]
) {
  // TODO this should ideally be actually changed content types, not maybeChanged
  const divergedContentTypeIds = affectedEntitiesIds(affectedEntities.contentTypes, [
    'added',
    'removed',
    'maybeChanged',
  ])

  // TODO this should ideally be actually changed entries, not maybeChanged
  const affectedEntryIds = affectedEntitiesIds(affectedEntities.entries, ['added', 'maybeChanged'])

  const contentTypeIdsOfAffectedEntries = [
    ...new Set<string>(
      entryComparables
        .filter((comparable) => affectedEntryIds.includes(comparable.sys.id))
        .map((comparable) => comparable.sys.contentType!.sys.id)
    ),
  ]

  return contentTypeIdsOfAffectedEntries.filter((id) => divergedContentTypeIds.includes(id))
}
