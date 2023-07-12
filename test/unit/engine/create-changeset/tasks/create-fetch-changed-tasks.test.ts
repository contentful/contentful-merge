import { expect } from 'chai'
import { createStubInstance } from 'sinon'
import { GetEntriesParams } from '../../../../../src/engine/client'
import { initializeTask, matchChangeType } from '../../../test-utils'
import { MemoryLogger } from '../../../../../src/engine/logger/memory-logger'
import { sourceEntriesFixture, targetEntriesFixture } from '../../../fixtures/entries'
import { createChangeset } from '../../../../../src/engine/utils/create-changeset'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { createFetchChangedTasks } from '../../../../../src/engine/create-changeset/tasks/create-fetch-changed-tasks'

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

describe('createFetchChangedTasks', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = {
      sourceEnvironmentId,
      targetEnvironmentId,
      logger: createStubInstance(MemoryLogger),
      client: mockClient,
      affectedEntities: {
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
        },
      },
      statistics: {
        added: 0,
        changed: 0,
        removed: 0,
        nonChanged: 0,
      },
      limits: {
        all: 100,
        changed: 100,
        added: 100,
        removed: 100,
      },
      exceedsLimits: false,
      changeset: createChangeset('staging', 'qa'),
    } as unknown as CreateChangesetContext
  })
  it('fetches the full payload of all changed entries and calculates changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries', skipHandler: () => false }), context)

    expect(context.changeset.items.length).to.equal(0)
    await task.run()
    expect(context.changeset.items.length).to.equal(7)
  })
  it('adds 2 added items to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries', skipHandler: () => false }), context)
    await task.run()
    const addedItems = context.changeset.items.filter(matchChangeType('added'))

    expect(addedItems.length).to.equal(2)
  })
  it('adds 2 deleted items to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries', skipHandler: () => false }), context)
    await task.run()
    const deletedItems = context.changeset.items.filter(matchChangeType('deleted'))

    expect(deletedItems.length).to.equal(2)
  })
  it('adds 3 changed item to the changeset', async () => {
    const task = initializeTask(createFetchChangedTasks({ entityType: 'entries', skipHandler: () => false }), context)
    await task.run()
    const changedItems = context.changeset.items.filter(matchChangeType('changed'))

    expect(changedItems.length).to.equal(3)
  })
  it.skip('TODO [skipped]: respects the limit parameter', async () => {
    /* TODO */
  })
})
