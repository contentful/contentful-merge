import { expect } from '@oclif/test'
import { Config } from '@oclif/core'
import ApplyCommand from '../../../../src/commands/apply'
import { fancy } from 'fancy-test'
import { AxiosError } from 'axios'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'

import fs from 'node:fs/promises'
import sinon from 'sinon'
import { writeLog } from '../../../../src/engine/logger/write-log'
import { LimitsExceededForApplyError } from '../../../../src/engine/errors'
import { ApplyChangesetContext } from '../../../../src/engine/apply-changeset/types'
import { createApplyChangesetContext } from '../../fixtures/apply-changeset-context-fixture'
import * as client from '../../../../src/engine/client'
import { createMockClient } from '../../fixtures/create-mock-client'

const cmd = new ApplyCommand(
  [],
  {} as unknown as Config // Runtime config, but not required for tests.
)

describe('Apply Command', () => {
  let writeFileStub: sinon.SinonStub
  let parseStub: sinon.SinonStub
  let readFileStub: sinon.SinonStub
  let createClientStub: sinon.SinonStub

  // We need to mock fs so we don't write log files during test runs
  beforeEach(() => {
    writeFileStub = sinon.stub(fs, 'writeFile')
    // @ts-expect-error: type error, but stubbing works fine
    parseStub = sinon.stub(cmd, 'parse')
    parseStub.resolves({
      flags: { space: '<space-id>', environment: '<environment-id>' },
    })
    readFileStub = sinon.stub(fs, 'readFile')
    readFileStub.resolves(JSON.stringify(createApplyChangesetContext().changeset))
    createClientStub = sinon.stub(client, 'createClient')
    createClientStub.returns(createMockClient())

    afterEach(() => {
      writeFileStub.restore()
      parseStub.restore()
      readFileStub.restore()
      createClientStub.restore()
    })
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
      expect(ctx.stdout).to.contain('Merge was unsuccessful 💔')
      expect(ctx.stdout).to.contain('An authorization issue occurred. Please make sure the CMA token is correct.')
    })

  fancy
    .stdout()
    .do(() => {
      const mockContext: ApplyChangesetContext = {
        ...createApplyChangesetContext(),
        limit: 20,
      } as unknown as ApplyChangesetContext
      const mockError = new LimitsExceededForApplyError(mockContext)
      cmd.catch(mockError)
    })
    .it('should inform on entry limit and number of changes on LimitsExceeded Error', (ctx) => {
      expect(ctx.stdout).to.contain('Merge was unsuccessful 💔')
      expect(ctx.stdout).to.contain('allowed limit is 20 entries')
    })

  fancy
    .stdout()
    .do(() => {
      const mockError = new Error('Unknown Error')
      cmd.catch(mockError)
    })
    .it('should inform on Unknown Error', (ctx) => {
      expect(ctx.stdout).to.contain('Merge was unsuccessful 💔')
      expect(ctx.stdout).to.contain('Unknown Error')
    })

  it('writeLog triggers log file creation', async () => {
    const logFileOutput = await writeLog({ getType: () => 'apply-changeset' } as MemoryLogger)
    expect(logFileOutput).to.contain('apply-changeset')
    expect(logFileOutput).to.contain('.log')
    expect(writeFileStub.called).to.be.true
  })

  fancy
    .stdout()
    .do(() =>
      new ApplyCommand(
        ['--space', 'some-space-id', '--environment', 'target-env-id', '--cma-token', 'some-cma-token', '--yes', '--file', 'some-file-path'],
        {} as unknown as Config // Runtime config, but not required for tests.
      ).run()
    )
    .it('should print validations and skips confirmation if --yes flag is set', (output) => {
      expect(output.stdout).to.contain('The changeset will be applied with the following constraints:')
      expect(output.stdout).to.include('[Skipping confirmation because --yes flag was provided]')
    })

  fancy
    .stdout()
    .stdin('Y\n', 10) // small delay to make sure the stdin is read
    .do(() =>
      new ApplyCommand(
        ['--space', 'some-space-id', '--environment', 'target-env-id', '--cma-token', 'some-cma-token', '--file', 'some-file-path'],
        {} as unknown as Config // Runtime config, but not required for tests.
      ).run()
    )
    .it('should print validations and and ask for user confirmation before merge', (output) => {
      expect(output.stdout).to.contain('The changeset will be applied with the following constraints:')
      process.stdin.once('data', (data) => expect(data.toString()).to.equal('Y\n'))
      expect(output.stdout).not.to.include('[Skipping confirmation because --yes flag was provided]')
    })
})
