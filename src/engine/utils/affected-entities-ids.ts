import { AffectedEntityData, AffectedKeys } from '../create-changeset/types'

export const affectedEntitiesIds = (affectedEntities: AffectedEntityData, affectedTypes: AffectedKeys[]): string[] => {
  const result = []

  if (affectedTypes.includes('added')) {
    result.push(...affectedEntities.added)
  }

  if (affectedTypes.includes('removed')) {
    result.push(...affectedEntities.removed)
  }

  if (affectedTypes.includes('maybeChanged')) {
    result.push(...affectedEntities.maybeChanged.map((comparable) => comparable.sys.id))
  }

  return result
}
