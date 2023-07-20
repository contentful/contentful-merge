import type { AffectedEntityData, Comparable } from '../create-changeset/types'
import { EntityType } from '../types'
import { affectedEntitiesIds } from './affected-entities-ids'

// Calculates the ids of diverged content types only for affected entries
export function divergedContentTypeIdsOfAffectedEntries(
  affectedEntities: Record<EntityType, AffectedEntityData>,
  entryComparables: Comparable[]
) {
  const divergedContentTypeIds = affectedEntitiesIds(affectedEntities.contentTypes, ['added', 'changed'])
  const affectedEntryIds = affectedEntitiesIds(affectedEntities.entries, ['added', 'changed'])

  const contentTypeIdsOfAffectedEntries = [
    ...new Set<string>(
      entryComparables
        .filter((comparable) => affectedEntryIds.includes(comparable.sys.id))
        .map((comparable) => comparable.sys.contentType!.sys.id)
    ),
  ]

  return contentTypeIdsOfAffectedEntries.filter((id) => divergedContentTypeIds.includes(id))
}
