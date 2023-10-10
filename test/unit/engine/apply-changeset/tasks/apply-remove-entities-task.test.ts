import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { applyRemoveEntitiesTask } from '../../../../../src/engine/apply-changeset/tasks/apply-remove-entities-task'
import { beforeEach } from 'mocha'
import { DeletedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'

describe('applyRemoveEntitiesTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('removes an entry from changeset', async () => {
    const removeChangesetItem: DeletedChangesetItem = createLinkObject('delete-entry', 'delete', 'Entry')

    class Spy {
      called = 0

      call = (args: any): any => {
        expect(args.environment).to.be.equal('qa')
        expect(args.entryId).to.be.equal('delete-entry')

        this.called++

        return {}
      }
    }

    const spy = new Spy()

    context.client.cma.entries.delete = spy.call
    context.changeset.items.push(removeChangesetItem)

    const task = initializeTask(applyRemoveEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal('✨ successfully deleted delete-entry')
    expect(spy.called).to.be.equal(1)
  })
})
