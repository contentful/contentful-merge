import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createLoadChangesetTask } from '../../../../../src/engine/apply-changeset/tasks/create-load-changeset-task'
import { beforeEach } from 'mocha'
import { DeletedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import * as sinon from 'sinon'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'
import path from 'path'

describe('createLoadChangesetTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('loads changeset from file', async () => {
    context.inputPath = path.resolve(__dirname, './test-loading-changeset')

    const task = initializeTask(createLoadChangesetTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal(`Loading data from ${path.resolve(__dirname, './test-loading-changeset')}`)
  })
})
