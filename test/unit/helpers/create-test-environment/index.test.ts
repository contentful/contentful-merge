import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import sinon from 'sinon'
import { createTestEnvironment } from '../../../helpers/create-test-environment'

describe('createTestEnvironment', () => {
  const pending = { sys: { id: 'environment-id', status: { sys: { id: 'queued' } } } }
  const ready = { sys: { id: 'environment-id', status: { sys: { id: 'ready' } } } }
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers()
    sinon.stub(console, 'log')
  })

  afterEach(() => {
    sinon.restore()
  })

  it('waits for readiness and returns the refreshed environment', async () => {
    const space = {
      createEnvironment: sinon.stub().resolves(pending),
      getEnvironment: sinon.stub().onFirstCall().resolves(pending).onSecondCall().resolves(ready),
    }
    const result = createTestEnvironment(space, 'test environment')

    await clock.tickAsync(1000)

    expect(await result).to.equal(ready)
    sinon.assert.calledWithExactly(space.createEnvironment, { name: 'test environment' })
    sinon.assert.alwaysCalledWithExactly(space.getEnvironment, 'environment-id')
    sinon.assert.calledTwice(space.getEnvironment)
  })

  it('rejects names over 40 characters before creating an environment', async () => {
    const space = { createEnvironment: sinon.stub(), getEnvironment: sinon.stub() }

    await rejects(createTestEnvironment(space, 'x'.repeat(41)), /exceeds 40 characters/)

    sinon.assert.notCalled(space.createEnvironment)
  })

  it('stops polling after the readiness timeout', async () => {
    const space = {
      createEnvironment: sinon.stub().resolves(pending),
      getEnvironment: sinon.stub().resolves(pending),
    }
    const result = rejects(createTestEnvironment(space, 'test environment'), /not ready after five minutes/)

    await clock.tickAsync(301000)
    await result

    expect(space.getEnvironment.callCount).to.equal(301)
  })

  it('propagates creation failures without polling', async () => {
    const error = new Error('creation failed')
    const space = { createEnvironment: sinon.stub().rejects(error), getEnvironment: sinon.stub() }

    await rejects(createTestEnvironment(space, 'test environment'), error)

    sinon.assert.notCalled(space.getEnvironment)
  })
})
