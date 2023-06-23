import { expect } from 'chai'
import { Entry } from 'contentful'
import { createStubInstance } from 'sinon'
import { GetEntriesParams } from '../../../../../src/engine/client'
import { initializeTask, matchChangeType } from '../../../test-utils'
import { MemoryLogger } from '../../../../../src/engine/logger/memory-logger'
import { sourceEntriesFixture, targetEntriesFixture } from '../../../fixtures/entries'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { AddedChangesetItem, ChangedChangesetItem, DeletedChangesetItem } from '../../../../../src/engine/types'
import {
  cleanEntity,
  createFetchAddedEntitiesTask,
} from '../../../../../src/engine/create-changeset/tasks/create-fetch-added-entities-task'

const sourceEnvironmentId = 'staging'
const targetEnvironmentId = 'qa'

const mockClient = {
  cma: {},
  cda: {
    entries: {
      getMany: async ({ environment, query }: GetEntriesParams) => {
        switch (environment) {
          case sourceEnvironmentId:
            return sourceEntriesFixture
          case targetEnvironmentId:
            return targetEntriesFixture
        }
      },
    },
  },
}

describe('createFetchAddedEntitiesTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = {
      sourceEnvironmentId,
      logger: createStubInstance(MemoryLogger),
      client: mockClient,
      ids: {
        added: ['3op5VIqGZiwoe06c8IQIMO', '6gFiJvssqQ62CMYqECOu2M'],
        removed: ['34MlmiuMgU8wKCOOIkAuMy'],
      },
      maybeChanged: [
        {
          sys: {
            id: '2uNOpLMJioKeoMq8W44uYc',
            updatedAt: '2023-05-17T10:36:43.271Z',
          },
        },
      ],
      statistics: {
        nonChanged: 0,
      },
      limits: {
        all: 100,
        changed: 100,
        added: 100,
        removed: 100,
      },
      exceedsLimits: false,
      changeset: {
        sys: {
          type: 'Changeset',
          entityType: 'Entry',
          createdAt: '1687163005535',
          version: 1,
          source: {
            sys: {
              id: 'staging',
              linkType: 'Environment',
              type: 'Link',
            },
          },
          target: {
            sys: {
              id: 'qa',
              linkType: 'Environment',
              type: 'Link',
            },
          },
        },
        items: [
          {
            changeType: 'changed',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '2uNOpLMJioKeoMq8W44uYc',
              },
            },
            patch: [
              {
                op: 'replace',
                path: '/fields/slug/en-US',
                value: 'home',
              },
              {
                op: 'replace',
                path: '/fields/title/en-US',
                value: 'Home',
              },
            ],
          },
          {
            changeType: 'deleted',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '34MlmiuMgU8wKCOOIkAuMy',
              },
            },
          },
          {
            changeType: 'added',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '3op5VIqGZiwoe06c8IQIMO',
              },
            },
          },
          {
            changeType: 'added',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '6gFiJvssqQ62CMYqECOu2M',
              },
            },
          },
        ],
      },
    } as unknown as CreateChangesetContext
  })
  it('fetches the full payload of all added entries and adds it to the changeset', async () => {
    const task = initializeTask(createFetchAddedEntitiesTask(true), context)

    const addedItems = context.changeset.items.filter(matchChangeType('added')) as AddedChangesetItem[]

    expect(addedItems).to.satisfy((items: AddedChangesetItem[]) => items.every((item) => item.data === undefined))
    await task.run()
    expect(addedItems).to.satisfy((items: AddedChangesetItem[]) =>
      items.every(
        (item) =>
          item.data !== undefined &&
          item.data.sys !== undefined &&
          item.data.fields !== undefined &&
          item.data.metadata !== undefined
      )
    )
  })
  it('does not fetch anything for changed entries', async () => {
    const task = initializeTask(createFetchAddedEntitiesTask(true), context)

    const changedItems = context.changeset.items.filter(matchChangeType('changed'))

    // @ts-expect-error: asserting that a property does not exist
    expect(changedItems).to.satisfy((items: ChangedChangesetItem[]) => items.every((item) => item.data === undefined))
    await task.run()
    // @ts-expect-error: asserting that a property does not exist
    expect(changedItems).to.satisfy((items: ChangedChangesetItem[]) => items.every((item) => item.data === undefined))
  })
  it('does not fetch anything for deleted entries', async () => {
    const task = initializeTask(createFetchAddedEntitiesTask(true), context)

    const deletedItems = context.changeset.items.filter(matchChangeType('deleted'))

    // @ts-expect-error: asserting that a property does not exist
    expect(deletedItems).to.satisfy((items: DeletedChangesetItem[]) => items.every((item) => item.data === undefined))
    await task.run()
    // @ts-expect-error: asserting that a property does not exist
    expect(deletedItems).to.satisfy((items: DeletedChangesetItem[]) => items.every((item) => item.data === undefined))
  })
  it.skip('TODO [skipped]: respects the limit parameter', async () => {
    /* TODO */
  })
})

describe('cleanEntity', () => {
  it('removes all but three sys properties from an entry', () => {
    const entry = { ...sourceEntriesFixture.items[0] } as unknown as Entry<any>

    expect(Object.keys(entry.sys)).to.have.length(8)

    const cleanedEntry = cleanEntity(entry)
    expect(Object.keys(cleanedEntry.sys)).to.have.length(3)
    expect(cleanedEntry.sys).to.have.property('id')
    expect(cleanedEntry.sys).to.have.property('type')
    expect(cleanedEntry.sys).to.have.property('contentType')
  })
})
