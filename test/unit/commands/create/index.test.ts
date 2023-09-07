import { expect } from '@oclif/test'
import { Config } from '@oclif/core'
import CreateCommand from '../../../../src/commands/create'
import { fancy } from 'fancy-test'
import { AxiosError } from 'axios'
import {
  ContentModelDivergedError,
  LimitsExceededContext,
  LimitsExceededForCreateError,
} from '../../../../src/engine/errors'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'

import fs from 'node:fs/promises'
import sinon from 'sinon'
import { writeLog } from '../../../../src/engine/logger/write-log'

const cmd = new CreateCommand(
  [],
  {} as unknown as Config // Runtime config, but not required for tests.
)

describe('Create Command', () => {
  let writeFileStub: sinon.SinonStub
  let parseStub: sinon.SinonStub

  // We need to mock fs so we don't write log files during test runs
  beforeEach(() => {
    writeFileStub = sinon.stub(fs, 'writeFile')
    // @ts-expect-error: type error, but stubbing works fine
    parseStub = sinon.stub(cmd, 'parse')
    parseStub.resolves({
      flags: { space: '<space-id>', source: '<source-env>', target: '<target-env>' },
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
      const mockContext: LimitsExceededContext = {
        limit: 20,
        affectedEntities: { entries: { added: [], removed: [], maybeChanged: ['test-entry'] } },
      } as unknown as LimitsExceededContext
      const mockError = new LimitsExceededForCreateError(mockContext)
      cmd.catch(mockError)
    })
    .it('should inform on entry limit and number of changes on LimitsExceeded Error', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain('allowed limit is 20 entries')
      expect(ctx.stdout).to.contain('1 entry to be compared')
      expect(ctx.stdout).to.contain('0 added entries')
      expect(ctx.stdout).to.contain('0 removed entries')
    })

  fancy
    .stdout()
    .do(() => {
      const mockError = new ContentModelDivergedError(['test-content-type', 'test-content-type-2'])
      cmd.catch(mockError)
    })
    .it('should inform on diverged content models', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain(
        'The content models of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.'
      )
      expect(ctx.stdout).to.contain(`Diverged content types: test-content-type, test-content-type-2`)
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
    const logFileOutput = await writeLog({ getType: () => 'create-changeset' } as MemoryLogger)
    expect(logFileOutput).to.contain('create-changeset')
    expect(logFileOutput).to.contain('.log')
    expect(writeFileStub.called).to.be.true
  })
})
