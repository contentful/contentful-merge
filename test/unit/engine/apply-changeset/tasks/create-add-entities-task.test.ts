import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createAddEntitiesTask } from '../../../../../src/engine/apply-changeset/tasks/create-add-entities-task'
import { beforeEach } from 'mocha'
import { AddedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import * as sinon from 'sinon'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'

describe('createAddEntitiesTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('creates an entry from changeset', async () => {
    const addedChangesetItem: AddedChangesetItem = createLinkObject('added-entry', 'add', 'Entry')

    addedChangesetItem.data = {
      // added entry
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'added-entry',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.538Z',
        updatedAt: '2023-05-17T10:36:40.280Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {},
    }

    const createdEntry = {
      sys: {
        id: 'added-entry',
      },
    }

    context.client.cma.entries.create = sinon.stub().resolves(createdEntry)
    context.changeset.items.push(addedChangesetItem)

    const task = initializeTask(createAddEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal('✨ successfully created added-entry')
  })
})
