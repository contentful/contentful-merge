import { expect } from 'chai'
import { initializeTask } from '../../../test-utils'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'
import { EnvironmentIdFixture } from '../../../fixtures/environment-id-fixtures'
import { createChangesetTasks } from '../../../../../src/engine/create-changeset/tasks'

describe('fetchPartialEntitiesTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext()
  })
  it("fetches all entries' sys info of the source environment and collects them in the 'source' section of the context", async () => {
    const task = initializeTask(
      createChangesetTasks.fetchPartialEntitiesTask({
        scope: 'source',
        environmentId: EnvironmentIdFixture.source,
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
      createChangesetTasks.fetchPartialEntitiesTask({
        scope: 'target',
        environmentId: EnvironmentIdFixture.target,
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
