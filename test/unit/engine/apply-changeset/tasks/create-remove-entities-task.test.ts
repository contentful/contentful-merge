import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createRemoveEntitiesTask } from '../../../../../src/engine/apply-changeset/tasks/create-remove-entities-task'
import { beforeEach } from 'mocha'
import { DeletedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import * as sinon from 'sinon'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'

describe('createRemoveEntitiesTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('removes an entry from changeset', async () => {
    const removeChangesetItem: DeletedChangesetItem = createLinkObject('delete-entry', 'delete', 'Entry')

    context.client.cma.entries.delete = sinon.stub().resolves({})
    context.changeset.items.push(removeChangesetItem)

    const task = initializeTask(createRemoveEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal('✨ successfully deleted delete-entry')
  })
})
