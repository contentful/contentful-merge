import { expect, test } from '@oclif/test'

describe('runs', () => {
  test
    .stdout()
    .command(['help'])
    .it('help cmd', (ctx) => {
      expect(ctx.stdout).to.contain('Display help for ccccli.')
    })
})
