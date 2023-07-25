import { EntityType } from '../types'
import { AffectedEntityData } from './types'

type AffectedEntities = Record<EntityType, AffectedEntityData>

export interface LimitsExceededContext {
  limit: number
  affectedEntities: AffectedEntities
}

export class LimitsExceededError extends Error {
  public affectedEntities: AffectedEntities

  constructor(context: LimitsExceededContext) {
    const message = `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limit} entries.`
    super(message)
    this.affectedEntities = context.affectedEntities
  }
}
