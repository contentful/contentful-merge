import { ClientAPI, CreateApiKeyProps, Environment, MetaLinkProps, Space, createClient } from 'contentful-management'
import { Config, expect, test } from '@oclif/test'
import fs from 'fs'
import fancy from './register-plugins'
import { TestContext, createSpace, createEnvironment } from './bootstrap'
import * as testUtils from '@contentful/integration-test-utils'

const organizationId = process.env.ORG_ID!
if (!organizationId) {
  throw new Error('Please provide an `ORG_ID`')
}
const cmaToken = process.env.CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide an `CMA_TOKEN`')
}

const targetEnvironmentId = 'master'

let testContext: TestContext
before(async () => {
  const client = createClient({ accessToken: cmaToken })
  const testSpace = await createSpace(client, organizationId)
  testContext = await createEnvironment(testSpace, targetEnvironmentId)
})

after(() =>
  testUtils.cleanUpTestSpaces({
    threshold: 0,
    dryRun: false,
  })
)

describe('create - happy path', () => {
  fancy
    .stdout()
    .createTestData(() => testContext.sourceEnvironment)
    .runCreateCommand(() => testContext, targetEnvironmentId, cmaToken)
    .finally(async (ctx) => {
      await ctx.deleteTestData()
    })
    .it('should create a changeset when environments differ', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain(
        'Created a new changeset for 2 environments with 1 source entities and 0 target entities.'
      )
      expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 1 added and 0 changed entries.')
      expect(fs.existsSync('./changeset.json')).to.be.true
    })

  fancy
    .stdout()
    .runCreateCommand(() => testContext, targetEnvironmentId, cmaToken)
    .it('should not create a changeset when environments are the same', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain(
        'Created a new changeset for 2 environments with 0 source entities and 0 target entities.'
      )
      expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 0 added and 0 changed entries.')
      expect(fs.existsSync('./changeset.json')).to.be.true
    })
})

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
