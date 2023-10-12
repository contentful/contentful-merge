import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { beforeEach } from 'mocha'
import { AddedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'
import { ApplyChangesetTasks } from '../../../../../src/engine/apply-changeset/tasks'

describe('applyAddEntitiesTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('creates an entry from changeset', async () => {
    const addedChangesetItem: AddedChangesetItem = createLinkObject('added-entry', 'add', 'Entry')

    addedChangesetItem.data = {
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'added-entry',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.538Z',
        updatedAt: '2023-05-17T10:36:40.280Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        version: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {},
    }

    const createdEntry = {
      sys: {
        id: 'added-entry',
        version: 1,
      },
    }

    class Spy {
      called = 0

      callCreate = (args: any): any => {
        expect(args.environment).to.be.equal('qa')
        expect(args.entryId).to.be.equal('added-entry')
        expect(args.contentType).to.be.equal('lesson')

        this.called++

        return createdEntry
      }
      callPublish = (args: any): any => {
        expect(args.environment).to.be.equal('qa')
        expect(args.entryId).to.be.equal('added-entry')
        expect(args.entryVersion).to.be.equal(createdEntry.sys.version)

        this.called++
        return createdEntry
      }
    }

    const spy = new Spy()

    context.client.cma.entries.create = spy.callCreate
    context.client.cma.entries.publish = spy.callPublish
    context.changeset.items.push(addedChangesetItem)

    const task = initializeTask(ApplyChangesetTasks.createAddEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal('✨ successfully published added-entry')
    expect(spy.called).to.be.equal(2)
  })

  it('reports on error for failing entry publishing', async () => {
    const addedChangesetItem: AddedChangesetItem = createLinkObject('added-entry', 'add', 'Entry')

    addedChangesetItem.data = {
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'added-entry',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.538Z',
        updatedAt: '2023-05-17T10:36:40.280Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        version: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {},
    }

    const createdEntry = {
      sys: {
        id: 'added-entry',
        version: 1,
      },
    }

    class Spy {
      called = 0

      callCreate = (args: any): any => {
        expect(args.environment).to.be.equal('qa')
        expect(args.entryId).to.be.equal('added-entry')
        expect(args.contentType).to.be.equal('lesson')

        this.called++

        return createdEntry
      }
      callPublish = (args: any): any => {
        this.called++
        throw Error('Publishing failed')
      }
    }

    const spy = new Spy()

    context.client.cma.entries.create = spy.callCreate
    context.client.cma.entries.publish = spy.callPublish
    context.changeset.items.push(addedChangesetItem)

    const task = initializeTask(ApplyChangesetTasks.createAddEntitiesTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.not.null
    expect(task.tasks[0].output).to.be.equal('🚨 failed to publish added-entry')
    expect(spy.called).to.be.equal(2)
  })
})
