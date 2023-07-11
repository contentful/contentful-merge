import { BaseContext, Changeset, EntityType } from '../types'

export interface Comparable {
  sys: {
    id: string
    updatedAt: string
  }
}

export interface EntityData {
  ids: Array<string>
  comparables: Array<Comparable>
}

export type EnvironmentData = Record<EntityType, EntityData>

export type EnvironmentScope = 'source' | 'target'

export interface CreateChangesetContext extends BaseContext {
  sourceEnvironmentId: string
  targetEnvironmentId: string
  sourceData: EnvironmentData
  targetData: EnvironmentData
  inline: boolean

  affectedEntities: Record<
    EntityType,
    {
      added: Array<string>
      removed: Array<string>
      maybeChanged: Array<Comparable>
    }
  >

  changeset: Changeset
  statistics: {
    added: number
    changed: number
    removed: number
    nonChanged: number
  }
  limits: {
    all: number
    changed: number
    added: number
    removed: number
  }
  exceedsLimits: boolean
  contentModelDiverged: boolean
}
