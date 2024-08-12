import { AddedChangesetItem } from '../../engine/types'
import { createLinkObject } from '../../engine/utils/create-link-object'
import { EntryField } from 'contentful'
import { EntrySkeletonType } from 'contentful/dist/types/types/query'

export const createChangesetItemWithData = (
  contentTypeId: string,
  entryId: string,
  fields: EntryField<EntrySkeletonType> = {},
): AddedChangesetItem => {
  const referencedItem: AddedChangesetItem = createLinkObject(entryId, 'add', 'Entry')
  referencedItem.data = {
    sys: {
      space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
      id: entryId,
      type: 'Entry',
      createdAt: '2023-05-17T10:36:22.538Z',
      updatedAt: '2023-05-17T10:36:40.280Z',
      environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
      revision: 1,
      version: 1,
      contentType: { sys: { type: 'Link', linkType: 'ContentType', id: contentTypeId } },
    },
    fields,
  }
  return referencedItem
}
