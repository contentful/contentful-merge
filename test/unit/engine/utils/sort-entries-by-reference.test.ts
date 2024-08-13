import { AddedChangesetItem } from '../../../../src/engine/types'
import sortEntriesByReference from '../../../../src/engine/utils/sort-entries-by-reference'
import { expect } from 'chai'
import { createChangesetItemWithData } from '../../../../src/test/helpers/create-changeset-item-with-data'

describe('sortEntriesByReference', () => {
  const referencedItem: AddedChangesetItem = createChangesetItemWithData('lesson', 'added-entry')
  const referencedItem1: AddedChangesetItem = createChangesetItemWithData('lesson', 'added-entry1')
  const itemWithOneLink: AddedChangesetItem = createChangesetItemWithData('lesson1', 'added-entry-with-one-link', {
    referenceField: {
      'en-US': {
        sys: { type: 'Link', linkType: 'Entry', id: 'added-entry' },
      },
    },
  })

  const itemWithArrayLinks: AddedChangesetItem = createChangesetItemWithData('lesson2', 'added-entry-with-multi-link', {
    referencesField: {
      'en-US': [
        {
          sys: { type: 'Link', linkType: 'Entry', id: 'added-entry' },
        },
        {
          sys: { type: 'Link', linkType: 'Entry', id: 'added-entry1' },
        },
      ],
    },
  })

  const itemWithNonExistentLinks: AddedChangesetItem = createChangesetItemWithData(
    'lesson3',
    'added-entry-with-non-existent-link',
    {
      referenceField: {
        'en-US': {
          sys: { type: 'Link', linkType: 'Entry', id: 'random-entry' },
        },
      },
    },
  )

  const nonReferencedItem = createChangesetItemWithData('lesson', 'non-referenced-entry')

  it('should order based on references if the linked entry is present in the changeset', () => {
    // one link
    expect(sortEntriesByReference([itemWithOneLink, referencedItem, referencedItem1])).to.deep.equal([
      referencedItem,
      referencedItem1,
      itemWithOneLink,
    ])
    // multi link
    expect(sortEntriesByReference([itemWithArrayLinks, referencedItem, referencedItem1])).to.deep.equal([
      referencedItem,
      referencedItem1,
      itemWithArrayLinks,
    ])
    // both
    expect(
      sortEntriesByReference([itemWithArrayLinks, itemWithOneLink, referencedItem, referencedItem1]),
    ).to.deep.equal([referencedItem, referencedItem1, itemWithOneLink, itemWithArrayLinks])
  })

  it('should not reorder if the linked entry is not present in the changeset', () => {
    // one Link
    expect(sortEntriesByReference([itemWithOneLink, nonReferencedItem])).to.deep.equal([
      itemWithOneLink,
      nonReferencedItem,
    ])
    // Muli links
    expect(sortEntriesByReference([itemWithArrayLinks, nonReferencedItem])).to.deep.equal([
      itemWithArrayLinks,
      nonReferencedItem,
    ])
    //both
    expect(sortEntriesByReference([itemWithArrayLinks, itemWithOneLink, nonReferencedItem])).to.deep.equal([
      itemWithArrayLinks,
      itemWithOneLink,
      nonReferencedItem,
    ])
  })

  it('should not reorder there are no links in the changeset', () => {
    expect(sortEntriesByReference([nonReferencedItem, referencedItem, referencedItem1])).to.deep.equal([
      nonReferencedItem,
      referencedItem,
      referencedItem1,
    ])
  })

  it('should reorder only entries with links present in the changeset', () => {
    // with links non present in the changeset
    expect(
      sortEntriesByReference([itemWithNonExistentLinks, referencedItem, referencedItem1, nonReferencedItem]),
    ).to.deep.equal([itemWithNonExistentLinks, referencedItem, referencedItem1, nonReferencedItem])
    // With Both links present and not present
    expect(
      sortEntriesByReference([
        itemWithArrayLinks,
        referencedItem,
        referencedItem1,
        nonReferencedItem,
        itemWithNonExistentLinks,
      ]),
    ).to.deep.equal([referencedItem, referencedItem1, nonReferencedItem, itemWithNonExistentLinks, itemWithArrayLinks])
    expect(
      sortEntriesByReference([
        itemWithArrayLinks,
        itemWithOneLink,
        itemWithNonExistentLinks,
        referencedItem,
        referencedItem1,
        nonReferencedItem,
      ]),
    ).to.deep.equal([
      itemWithNonExistentLinks,
      referencedItem,
      referencedItem1,
      nonReferencedItem,
      itemWithOneLink,
      itemWithArrayLinks,
    ])
  })
})
