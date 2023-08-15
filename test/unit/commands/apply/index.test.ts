import { expect } from '@oclif/test'
import { Config } from '@oclif/core'
import ApplyCommand from '../../../../src/commands/apply'
import { fancy } from 'fancy-test'
import { AxiosError } from 'axios'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'

import fs from 'node:fs/promises'
import sinon from 'sinon'
import { writeLog } from '../../../../src/engine/logger/write-log'

const cmd = new ApplyCommand(
  [],
  {} as unknown as Config // Runtime config, but not required for tests.
)

describe('Apply Command', () => {
  let writeFileStub: sinon.SinonStub
  let parseStub: sinon.SinonStub

  // We need to mock fs so we don't write log files during test runs
  beforeEach(() => {
    writeFileStub = sinon.stub(fs, 'writeFile')
    // @ts-expect-error: type error, but stubbing works fine
    parseStub = sinon.stub(cmd, 'parse')
    parseStub.resolves({
      flags: { space: '<space-id>', environment: '<environment-id>' },
    })
  })

  afterEach(() => {
    writeFileStub.restore()
    parseStub.restore()
  })

  fancy
    .stdout()
    .do(() => {
      const mockError = new AxiosError('Not found.')
      mockError.response = { data: [], status: 404, statusText: 'mock status text', headers: {}, config: {} }
      mockError.code = 'ERR_BAD_REQUEST'
      cmd.catch(mockError)
    })
    .it('should inform that api keys need access to all compared environments', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain(
        'An authorisation issue occurred. Please make sure the API key you provided has access to both environments.'
      )
    })

  fancy
    .stdout()
    .do(() => {
      const mockError = new Error('Unknown Error')
      cmd.catch(mockError)
    })
    .it('should inform on Unknown Error', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain('Unknown Error')
    })

  it('writeLog triggers log file creation', async () => {
    const logFileOutput = await writeLog({ getType: () => 'apply-changeset' } as MemoryLogger)
    expect(logFileOutput).to.contain('apply-changeset')
    expect(logFileOutput).to.contain('.log')
    expect(writeFileStub.called).to.be.true
  })
})
