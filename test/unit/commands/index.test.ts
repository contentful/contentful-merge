import { expect, test } from '@oclif/test'

describe('root:help', () => {
  test
    .stdout()
    .command(['help'])
    .it('lists create and apply command', (ctx) => {
      expect(ctx.stdout).to.contain('apply   Apply Changeset')
      expect(ctx.stdout).to.contain('create  Create Entries Changeset')
    })
})
