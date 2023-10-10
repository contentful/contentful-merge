import { expect } from 'chai'
import { Entry } from 'contentful'
import { initializeTask, matchChangeType } from '../../../test-utils'
import { sourceEntriesFixture } from '../../../fixtures/entries'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { AddedChangesetItem, UpdatedChangesetItem, DeletedChangesetItem } from '../../../../../src/engine/types'
import { cleanEntity } from '../../../../../src/engine/create-changeset/tasks/create-fetch-added-entities-task'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'
import { createChangeset } from '../../../../../src/engine/utils/create-changeset'
import { EnvironmentIdFixture } from '../../../fixtures/environment-id-fixtures'
import { CreateChangesetTasks } from '../../../../../src/engine/create-changeset/tasks'

describe('fetchAddedEntitiesTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext({
      affectedEntities: {
        contentTypes: { added: [], removed: [], maybeChanged: [], changed: [] },
        entries: {
          added: ['3op5VIqGZiwoe06c8IQIMO', '6gFiJvssqQ62CMYqECOu2M'],
          removed: ['34MlmiuMgU8wKCOOIkAuMy'],
          maybeChanged: [
            {
              sys: {
                id: '2uNOpLMJioKeoMq8W44uYc',
                updatedAt: '2023-05-17T10:36:43.271Z',
              },
            },
          ],
          changed: ['2uNOpLMJioKeoMq8W44uYc'],
        },
      },
      changeset: {
        sys: {
          type: 'Changeset',
          createdAt: '1687163005535',
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
            changeType: 'update',
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
            changeType: 'delete',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '34MlmiuMgU8wKCOOIkAuMy',
              },
            },
          },
          {
            changeType: 'add',
            entity: {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: '3op5VIqGZiwoe06c8IQIMO',
              },
            },
          },
          {
            changeType: 'add',
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
    })
  })
  it('fetches the full payload of all added entries and adds it to the changeset', async () => {
    context.changeset = createChangeset(EnvironmentIdFixture.source, EnvironmentIdFixture.target)

    const task = initializeTask(
      CreateChangesetTasks.createFetchAddedEntitiesTask({
        entityType: 'entries',
      }),
      context
    )

    const addedItems = context.changeset.items.filter(matchChangeType('add')) as AddedChangesetItem[]

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
    const task = initializeTask(
      CreateChangesetTasks.createFetchAddedEntitiesTask({
        entityType: 'entries',
      }),
      context
    )

    const changedItems = context.changeset.items.filter(matchChangeType('update'))

    // @ts-expect-error: asserting that a property does not exist
    expect(changedItems).to.satisfy((items: UpdatedChangesetItem[]) => items.every((item) => item.data === undefined))
    await task.run()
    // @ts-expect-error: asserting that a property does not exist
    expect(changedItems).to.satisfy((items: UpdatedChangesetItem[]) => items.every((item) => item.data === undefined))
  })
  it('does not fetch anything for deleted entries', async () => {
    const task = initializeTask(
      CreateChangesetTasks.createFetchAddedEntitiesTask({
        entityType: 'entries',
      }),
      context
    )

    const deletedItems = context.changeset.items.filter(matchChangeType('delete'))

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
