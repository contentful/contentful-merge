import { expect } from 'chai'
import { createTransformHandler } from '../../../../src/engine/logger/create-transform-handler'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'
import { ClientLogHandler } from '../../../../src/engine/logger/types'

describe('createTransformHandler', () => {
  let logger: MemoryLogger
  let logHandler: ClientLogHandler
  beforeEach(() => {
    logger = new MemoryLogger('create-changeset')
    logHandler = createTransformHandler(logger)
  })
  it("logs all 'error' level messages as 'ERROR' messages", () => {
    logHandler('error', 'Some mistake happened')
    expect(logger.toJSON()[0]).to.have.property('level', 'ERROR')
  })
  it("logs all non-'error' messages as 'INFO' messages", () => {
    logHandler('warning', 'Something is slow')
    expect(logger.toJSON()[0]).to.have.property('level', 'INFO')
  })
})
