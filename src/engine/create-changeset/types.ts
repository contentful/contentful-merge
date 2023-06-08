import { BaseContext, ChangeSet } from '../types'

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

export interface CreateChangesetContext extends BaseContext {
  sourceEnvironmentId: string
  targetEnvironmentId: string
  source: EnvironmentData
  target: EnvironmentData
  inline: boolean
  ids: {
    added: Array<string>
    removed: Array<string>
  }
  changed: Array<Comparable>
  changeSet: ChangeSet
  statistics: {
    nonChanged: number
  }
}
