import { expect } from 'chai'
import { Entry } from 'contentful'
import { createPatch } from '../../../../src/engine/utils/create-patch'
import { sourceEntriesFixture, targetEntriesFixture } from '../../fixtures/entries'

describe('createPatch', () => {
  it('creates a patch for changed string values', () => {
    const sourceEntry = sourceEntriesFixture.items[0] as unknown as Entry<any>
    const targetEntry = targetEntriesFixture.items[0] as unknown as Entry<any>
    const patch = createPatch({ targetEntry, sourceEntry })
    expect(patch).to.deep.equal([
      { op: 'replace', path: '/fields/title/en-US', value: 'Home page' },
      { op: 'replace', path: '/fields/slug/en-US', value: 'home-page' },
    ])
  })
  it('creates a patch for added list items', () => {
    const sourceEntry = sourceEntriesFixture.items[2] as unknown as Entry<any>
    const targetEntry = targetEntriesFixture.items[2] as unknown as Entry<any>
    const patch = createPatch({ targetEntry, sourceEntry })
    expect(patch).to.deep.equal([
      {
        op: 'replace',
        path: '/fields/modules/en-US/4/sys/id',
        value: '6gFiJvssqQ62CMYqECOu2M',
      },
      {
        op: 'add',
        path: '/fields/modules/en-US/5',
        value: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: '3k6uoYm9i8MycCm42IsY62',
          },
        },
      },
    ])
  })
  it('creates a patch for removed list items', () => {
    const sourceEntry = sourceEntriesFixture.items[3] as unknown as Entry<any>
    const targetEntry = targetEntriesFixture.items[4] as unknown as Entry<any>
    const patch = createPatch({ targetEntry, sourceEntry })
    expect(patch).to.deep.equal([{ op: 'remove', path: '/fields/modules/en-US/2' }])
  })
  it('creates a patch with ignored metadata', () => {
    const sourceEntry = sourceEntriesFixture.items[0] as unknown as Entry<any>
    const targetEntry = sourceEntriesFixture.items[0] as unknown as Entry<any>

    sourceEntry.metadata = {
      tags: [{ sys: { id: 'tag1', type: 'Link', linkType: 'Tag' } }],
    }
    const patch = createPatch({ targetEntry, sourceEntry })
    expect(patch).to.length(0)
  })
})
