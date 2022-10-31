import {Patch} from '@contentful/jsondiffpatch'
import {createClient} from '../client'

export interface BaseContext {
  client: ReturnType<typeof createClient>
  accessToken: string,
  spaceId: string,
  sourceEnvironmentId: string,
  targetEnvironmentId: string,
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

export interface EntryLink {
    type: 'Link',
    linkType: 'Entry',
    id: string
}

export type ChangedResult = {
  entity: EntryLink
  patch: Patch
}

export interface CreateChangesetContext extends BaseContext {
  source: EnvironmentData,
  target: EnvironmentData,
  inline: boolean,
  ids: {
    added: Array<string>,
    removed: Array<string>,
  }
  changed: Array<Comparable>,
  changeset?: any,
  statistics: {
    nonChanged: number
  }
}

