import {createClient} from '../client'
import {ChangeSet} from '../types'

// TODO: move to ../types.ts
export interface BaseContext {
  client: ReturnType<typeof createClient>
  accessToken: string,
  spaceId: string,
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
  limit: number,
}

export interface Comparable {
  sys: {
    id: string,
    updatedAt: string
  }
}

export interface EnvironmentData {
  ids: Array<string>,
  comparables: Array<Comparable>
}

export type EnvironmentScope = 'source' | 'target'

export interface CreateChangesetContext extends BaseContext {
  source: EnvironmentData,
  target: EnvironmentData,
  inline: boolean,
  ids: {
    added: Array<string>,
    removed: Array<string>,
  }
  changed: Array<Comparable>,
  changeSet: ChangeSet,
  statistics: {
    nonChanged: number
  }
}

