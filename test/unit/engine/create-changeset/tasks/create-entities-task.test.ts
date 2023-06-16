import { expect } from 'chai'
import { createStubInstance } from 'sinon'
import { initializeTask } from '../../../test-utils'
import { GetEntriesParams } from '../../../../../src/engine/client'
import { MemoryLogger } from '../../../../../src/engine/logger/memory-logger'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { sourceEntriesMockOnlySys, targetEntriesMockOnlySys } from '../../../mocks/entries'
import { createEntitiesTask } from '../../../../../src/engine/create-changeset/tasks/create-entities-task'

const sourceEnvironmentId = 'staging'
const targetEnvironmentId = 'qa'

const mockClient = {
  cma: {},
  cda: {
    entries: {
      getMany: async ({ environment, query }: GetEntriesParams) => {
        switch (environment) {
          case sourceEnvironmentId:
            return sourceEntriesMockOnlySys
          case targetEnvironmentId:
            return targetEntriesMockOnlySys
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
      source: { comparables: [], ids: [] },
      target: { comparables: [], ids: [] },
    } as unknown as CreateChangesetContext
  })
  it("fetches all entries' sys info of the source environment and collects them in the 'source' section of the context", async () => {
    const task = initializeTask(createEntitiesTask('source', sourceEnvironmentId), context)

    expect(context.source.comparables.length).to.equal(0)
    expect(context.source.ids.length).to.equal(0)
    await task.run()
    expect(context.source.comparables.length).to.equal(7)
    expect(context.source.ids.length).to.equal(7)
  })
  it("fetches all entries' sys info of the target environment and collects them in 'target' section of the context", async () => {
    const task = initializeTask(createEntitiesTask('target', targetEnvironmentId), context)

    expect(context.target.comparables.length).to.equal(0)
    expect(context.target.ids.length).to.equal(0)
    await task.run()
    expect(context.target.comparables.length).to.equal(7)
    expect(context.target.ids.length).to.equal(7)
  })
  it.skip('TODO [skipped]: respects the limit parameter', async () => {
    /* TODO */
  })
})
