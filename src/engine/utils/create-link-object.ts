import { BaseChangeSetItem, ChangeSetChangeType, ChangesetEntityLink } from '../types'

export const createLinkObject = <T extends ChangeSetChangeType>(
  id: string,
  changeType: T
): ChangesetEntityLink & BaseChangeSetItem<T> => ({
  changeType,
  entity: {
    sys: {
      type: 'Link',
      linkType: 'Entry',
      id,
    },
  },
})
