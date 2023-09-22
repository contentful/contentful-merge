import { Patch } from '@contentful/jsondiffpatch'
import { ListrTaskWrapper } from 'listr2'
import { createClient } from './client'
import { ResponseStatusCollector } from './client/response-status-collector'
import { ILogger } from './logger/types'
import { MemoryLogger } from './logger/memory-logger'

export type Client = ReturnType<typeof createClient>

export type ChangesetChangeType = 'add' | 'delete' | 'update'
type ChangesetItemType = 'Entry' | 'ContentType'

export interface EntityLink {
  type: 'Link'
  linkType: ChangesetItemType
  id: string
}

export type BaseChangesetItem<T extends ChangesetChangeType> = {
  changeType: T
}

export type ChangesetEntityLink = {
  entity: {
    sys: EntityLink
  }
}

export type DeletedChangesetItem = BaseChangesetItem<'delete'> & ChangesetEntityLink

export type AddedChangesetItem = BaseChangesetItem<'add'> &
  ChangesetEntityLink & {
    data?: any
  }

export type UpdatedChangesetItem = BaseChangesetItem<'update'> &
  ChangesetEntityLink & {
    patch: Patch
  }

export type ChangesetItem = DeletedChangesetItem | AddedChangesetItem | UpdatedChangesetItem

export type Changeset = {
  sys: {
    type: 'Changeset'
    createdAt: string
    source: {
      sys: {
        type: 'Link'
        linkType: 'Environment'
        id: string
      }
    }
    target: {
      sys: {
        type: 'Link'
        linkType: 'Environment'
        id: string
      }
    }
  }
  items: Array<ChangesetItem>
}

export interface BaseContext {
  client: Client
  logger: MemoryLogger
  accessToken: string
  spaceId: string
  limit?: number
}

export type BaseActionParams = {
  client: Client
  environmentId: string
  logger: ILogger
  responseCollector: ResponseStatusCollector
  task: ListrTaskWrapper<any, any>
}

export type CommandType = 'create-changeset' | 'apply-changeset'

export type EntityType = Exclude<keyof ReturnType<typeof createClient>['cda'], 'requestCounts'>
