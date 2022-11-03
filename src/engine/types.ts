import {Patch} from '@contentful/jsondiffpatch'

export type ChangeSetChangeType = 'deleted' | 'added' | 'changed'
type ChangeSetItemType = 'Entry' | 'Asset' | 'ContentType'

export interface EntityLink {
  type: 'Link',
  linkType: ChangeSetItemType,
  id: string
}

export type BaseChangeSetItem<T extends ChangeSetChangeType> = {
  changeType: T,
}

export type ChangesetEntityLink = {
  entity: {
    sys: EntityLink
  }
}

export type DeletedChangeSetItem = BaseChangeSetItem<'deleted'> & ChangesetEntityLink

// TODO: alternative version for inline payloads
export type AddedChangeSetItem = BaseChangeSetItem<'added'> & ChangesetEntityLink

export type ChangedChangeSetItem = BaseChangeSetItem<'changed'> & ChangesetEntityLink & {
  patch: Patch
}

export type ChangeSetItem = DeletedChangeSetItem | AddedChangeSetItem | ChangedChangeSetItem

export type ChangeSet = {
  sys: {
    type: 'ChangeSet',
    version: 1,
    createdAt: string,
    entityType: ChangeSetItemType | 'Mixed'
    source: {
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: string
      }
    },
    target: {
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: string
      }
    }
  },
  items: Array<ChangeSetItem>
}
