import { Patch } from '@contentful/jsondiffpatch'
import { ListrTaskWrapper } from 'listr2'
import { createClient } from './client'
import { ResponseStatusCollector } from './client/response-status-collector'
import { ILogger } from './logger/types'

export type Client = ReturnType<typeof createClient>

export type ChangesetChangeType = 'deleted' | 'added' | 'changed'
type ChangesetItemType = 'Entry' | 'Asset' | 'ContentType' | 'EditorInterface'

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

export type DeletedChangesetItem = BaseChangesetItem<'deleted'> & ChangesetEntityLink

export type AddedChangesetItem = BaseChangesetItem<'added'> &
  ChangesetEntityLink & {
    data?: any
  }

export type ChangedChangesetItem = BaseChangesetItem<'changed'> &
  ChangesetEntityLink & {
    patch: Patch
  }

export type ChangesetItem = DeletedChangesetItem | AddedChangesetItem | ChangedChangesetItem

export type Changeset = {
  sys: {
    type: 'Changeset'
    version: 1
    createdAt: string
    entityType: ChangesetItemType | 'Mixed'
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
  logger: ILogger
  accessToken: string
  spaceId: string
  limit: number
}

export type BaseActionParams = {
  client: Client
  environmentId: string
  logger: ILogger
  responseCollector: ResponseStatusCollector
  task: ListrTaskWrapper<any, any>
}

export type CommandType = 'create-changeset' | 'apply-changeset'
