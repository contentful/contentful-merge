import { expect } from 'chai'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'
import { LogLevel } from '../../../../src/engine/logger/types'

describe('MemoryLogger', () => {
  let logger: MemoryLogger
  beforeEach(() => {
    logger = new MemoryLogger('create-changeset')
  })
  it('returns the correct type', () => {
    expect(logger.getType()).to.equal('create-changeset')
  })
  it('collects logs', () => {
    let result = logger.toJSON()
    expect(result).to.have.length(0)

    logger.log(LogLevel.INFO, 'Have a nice day')
    logger.log(LogLevel.ERROR, new Error('Oh oh, something went wrong'))

    result = logger.toJSON()

    expect(result).to.have.length(2)
    expect(result[0].level).to.equal('INFO')
    expect(result[1].level).to.equal('ERROR')
  })
  it('returns readable string logs', () => {
    logger.log(LogLevel.INFO, 'Have a nice day')
    logger.log(LogLevel.ERROR, new Error('Oh oh, something went wrong'))

    expect(logger.toString()).to.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\t(INFO|ERROR)\t.+$/)
  })
})
