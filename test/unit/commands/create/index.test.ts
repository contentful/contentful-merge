import { expect } from '@oclif/test'
import { Config } from '@oclif/core'
import CreateCommand from '../../../../src/commands/create'
import { fancy } from 'fancy-test'
import { AxiosError } from 'axios'
import { LimitsExceededError } from '../../../../src/engine/create-changeset/errors'
import { CreateChangesetContext } from '../../../../src/engine/create-changeset/types'
import { MemoryLogger } from '../../../../src/engine/logger/memory-logger'
import sinon = require('sinon')

const cmd = new CreateCommand(
  [],
  {} as unknown as Config // Runtime config, but not required for tests.
)

describe('Create Command', () => {
  fancy
    .stdout()
    .do(() => {
      const mockError = new AxiosError('Not found.')
      mockError.response = { data: [], status: 404, statusText: 'mock status text', headers: {}, config: {} }
      mockError.code = 'ERR_BAD_REQUEST'
      cmd.catch(mockError)
    })
    .it('should inform that api keys need access to all compared environmentsa', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain(
        'An authorisation issue occurred. Please make sure the API key you provided has access to both environments.'
      )
    })

  fancy
    .stdout()
    .do(() => {
      const mockContext: CreateChangesetContext = {
        limits: { all: 20 },
        logger: { getType: () => 'create-changeset' } as MemoryLogger,
      } as CreateChangesetContext
      const mockError = new LimitsExceededError(mockContext)

      const stub = sinon.stub(cmd, 'writeFileLog').callsFake(async () => {
        return
      })

      cmd.catch(mockError)
      expect(stub.calledOnce).to.be.true
      stub.restore()
    })
    .it('should call writeFileLog and display output', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset could not be created 💔')
      expect(ctx.stdout).to.contain('allowed limit is 20 entries')
    })
})
