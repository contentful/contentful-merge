import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createChangeEntitiesTask } from '../../../../../src/engine/apply-changeset/tasks/create-change-entities-task'
import { beforeEach } from 'mocha'
import { UpdatedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import * as sinon from 'sinon'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'

describe('createChangeEntitiesTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('updates an entry from changeset', async () => {
    const updatedChangesetItem: UpdatedChangesetItem = {
      ...createLinkObject('update-entry', 'update', 'Entry'),
      patch: [],
    }

    const updatedEntry = {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'update-entry',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.538Z',
        updatedAt: '2023-05-17T10:36:40.280Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {},
    }

    class Spy {
      called = 0

      call = (args: any): any => {
        expect(args.environment).to.be.equal('qa')
        expect(args.entryId).to.be.equal('update-entry')

        this.called++

        return updatedEntry
      }
    }

    const spy = new Spy()

    context.client.cma.entries.update = spy.call
    context.client.cma.entries.get = spy.call

    context.changeset.items.push(updatedChangesetItem)

    const task = initializeTask(createChangeEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal('✨ successfully updated update-entry')
    expect(spy.called).to.be.equal(2)
  })
})
