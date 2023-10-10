import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { applyLoadChangesetTask } from '../../../../../src/engine/apply-changeset/tasks/apply-load-changeset-task'
import { beforeEach } from 'mocha'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'
import path from 'path'

describe('applyLoadChangesetTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  it('loads changeset from file', async () => {
    context.inputPath = path.resolve(__dirname, './test-loading-changeset')

    const task = initializeTask(applyLoadChangesetTask(), context)
    let error = null
    try {
      await task.run()
    } catch (err) {
      error = err
    }

    expect(error).to.be.null
    expect(task.tasks[0].output).to.be.equal(`Loading data from ${path.resolve(__dirname, './test-loading-changeset')}`)
    expect(context.changeset).to.deep.equal({ test: true })
  })
})
