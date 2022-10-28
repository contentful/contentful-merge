export interface BaseContext {
  accessToken: string,
  spaceId: string,
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
  requestCount: number,
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
  ids: {
    added: Array<string>,
    removed: Array<string>,
  }
  changed: Array<Comparable>,
  changeset?: any,
}

