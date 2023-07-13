import { BaseContext, CDAClient, Changeset } from '../types'

export interface Comparable {
  sys: {
    id: string
    updatedAt: string
  }
}

export interface EnvironmentData {
  ids: Array<string>
  comparables: Array<Comparable>
}

export type EnvironmentScope = 'source' | 'target'

export interface CreateChangesetContext extends BaseContext<CDAClient> {
  sourceEnvironmentId: string
  targetEnvironmentId: string
  source: EnvironmentData
  target: EnvironmentData
  inline: boolean
  ids: {
    added: Array<string>
    removed: Array<string>
  }
  maybeChanged: Array<Comparable>
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
}
