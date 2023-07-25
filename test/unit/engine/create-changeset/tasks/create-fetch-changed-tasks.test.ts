import { expect } from 'chai'
import { initializeTask, matchChangeType } from '../../../test-utils'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { createFetchChangedTasks } from '../../../../../src/engine/create-changeset/tasks/create-fetch-changed-tasks'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'
import { EnvironmentIdFixture } from '../../../fixtures/environment-id-fixtures'
import { sourceEntriesFixture, targetEntriesFixture } from '../../../fixtures/entries'
;``
describe('createFetchChangedTasks', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext({
      affectedEntities: {
        contentTypes: { added: [], removed: [], maybeChanged: [], changed: [] },
        entries: {
          added: ['3op5VIqGZiwoe06c8IQIMO', '6gFiJvssqQ62CMYqECOu2M'],
          removed: ['34MlmiuMgU8wKCOOIkAuMy', '1toEOumnkEksWakieoeC6M'],
          maybeChanged: [
            {
              sys: {
                id: '2uNOpLMJioKeoMq8W44uYc',
                updatedAt: '2023-05-17T10:36:43.271Z',
              },
            },
            {
              sys: {
                id: '3jkW4CdxPqu8Q2oSgCeOuy',
                updatedAt: '2023-05-17T10:36:42.612Z',
              },
            },
            {
              sys: {
                id: '5mgMoU9aCWE88SIqSIMGYE',
                updatedAt: '2023-05-17T10:36:42.033Z',
              },
            },
            {
              sys: {
                id: '5p9qNpTOJaCE6ykC4a8Wqg',
                updatedAt: '2023-05-17T10:36:40.860Z',
              },
            },
          ],
          changed: [],
        },
      },
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context.client.cda.entries.getMany = async ({ environment }) => {
      switch (environment) {
        case EnvironmentIdFixture.source:
          return sourceEntriesFixture
        case EnvironmentIdFixture.target:
          return targetEntriesFixture
      }
    }
  })

  it('fetches the full payload of all changed entries and calculates changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries' }), context)

    expect(context.changeset.items.length).to.equal(0)
    expect(context.affectedEntities.entries.maybeChanged.length).to.equal(4)

    await task.run()
    expect(context.changeset.items.length).to.equal(7)
  })
  it('adds 2 added items to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries' }), context)
    await task.run()
    const addedItems = context.changeset.items.filter(matchChangeType('added'))

    expect(addedItems.length).to.equal(2)
  })
  it('adds 2 deleted items to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries' }), context)
    await task.run()
    const deletedItems = context.changeset.items.filter(matchChangeType('deleted'))

    expect(deletedItems.length).to.equal(2)
  })
  it('adds 3 changed items to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries' }), context)
    await task.run()

    const changedItems = context.changeset.items.filter(matchChangeType('changed'))

    expect(changedItems.length).to.equal(3)
  })
  it('adds the ids of 3 changed item to the `changed` array', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries' }), context)
    const changedEntryIds = context.affectedEntities.entries.changed

    expect(changedEntryIds).to.deep.equal([])

    await task.run()

    expect(changedEntryIds).to.deep.equal([
      '2uNOpLMJioKeoMq8W44uYc',
      '5mgMoU9aCWE88SIqSIMGYE',
      '5p9qNpTOJaCE6ykC4a8Wqg',
    ])
  })
  it.skip('TODO [skipped]: respects the limit parameter', async () => {
    /* TODO */
  })
})
