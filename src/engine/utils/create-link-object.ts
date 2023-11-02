import { BaseChangesetItem, ChangesetChangeType, ChangesetEntityLink } from '../types'

export const createLinkObject = <T extends ChangesetChangeType>(
  id: string,
  changeType: T,
  linkType: 'Entry' | 'ContentType',
): ChangesetEntityLink & BaseChangesetItem<T> => ({
  changeType,
  entity: {
    sys: {
      type: 'Link',
      linkType,
      id,
    },
  },
})
