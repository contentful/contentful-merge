import { expect } from 'chai'
import { createStubInstance } from 'sinon'
import { initializeTask } from '../../../test-utils'
import { GetEntriesParams } from '../../../../../src/engine/client'
import { MemoryLogger } from '../../../../../src/engine/logger/memory-logger'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { sourceEntriesFixtureOnlySys, targetEntriesFixtureOnlySys } from '../../../fixtures/entries'
import { createEntitiesTask } from '../../../../../src/engine/create-changeset/tasks/create-entities-task'

const sourceEnvironmentId = 'staging'
const targetEnvironmentId = 'qa'

const mockClient = {
  cma: {},
  cda: {
    entries: {
      getMany: async ({ environment }: GetEntriesParams) => {
        switch (environment) {
          case sourceEnvironmentId:
            return sourceEntriesFixtureOnlySys
          case targetEnvironmentId:
            return targetEntriesFixtureOnlySys
        }
      },
    },
  },
}

describe('createEntitiesTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = {
      logger: createStubInstance(MemoryLogger),
      client: mockClient,
      sourceData: { entries: { comparables: [], ids: [] } },
      targetData: { entries: { comparables: [], ids: [] } },
    } as unknown as CreateChangesetContext
  })
  it("fetches all entries' sys info of the source environment and collects them in the 'source' section of the context", async () => {
    const task = initializeTask(
      createEntitiesTask({
        scope: 'source',
        environmentId: sourceEnvironmentId,
        entityType: 'entries',
      }),
      context
    )

    expect(context.sourceData.entries.comparables.length).to.equal(0)
    expect(context.sourceData.entries.ids.length).to.equal(0)
    await task.run()
    expect(context.sourceData.entries.comparables.length).to.equal(7)
    expect(context.sourceData.entries.ids.length).to.equal(7)
  })
  it("fetches all entries' sys info of the target environment and collects them in 'target' section of the context", async () => {
    const task = initializeTask(
      createEntitiesTask({
        scope: 'target',
        environmentId: targetEnvironmentId,
        entityType: 'entries',
      }),
      context
    )

    expect(context.targetData.entries.comparables.length).to.equal(0)
    expect(context.targetData.entries.ids.length).to.equal(0)
    await task.run()
    expect(context.targetData.entries.comparables.length).to.equal(7)
    expect(context.targetData.entries.ids.length).to.equal(7)
  })
  it.skip('TODO [skipped]: respects the limit parameter', async () => {
    /* TODO */
  })
})
