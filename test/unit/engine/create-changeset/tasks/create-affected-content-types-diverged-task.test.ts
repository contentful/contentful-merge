import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createAffectedContentTypesDivergedTask } from '../../../../../src/engine/create-changeset/tasks/create-affected-content-types-diverged-task'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'

describe('createAffectedContentTypesDivergedTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext({
      affectedEntities: {
        entries: context.affectedEntities.entries,
        contentTypes: {
          added: [],
          removed: [],
          maybeChanged: [],
        },
      },
    })
  })

  it.skip('adds added ids to the context', async () => {
    const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
    await task.run()

    expect(context.contentModelDiverged).to.true
  })
})
