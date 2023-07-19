import { expect } from '@oclif/test'
import { Config } from '@oclif/core'
import CreateCommand from '../../../../src/commands/create'
import { fancy } from 'fancy-test'
import { AxiosError } from 'axios'

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
      expect(ctx.stdout).to.contain('Something went wrong 💔')
      expect(ctx.stdout).to.contain(
        'Access denied. Please make sure the api key you are providing has access to all compared environments.'
      )
    })
})
