import { expect } from '@oclif/test'
import { Space, createClient } from 'contentful-management'
import fs from 'fs'
import { TestContext, createEnvironment, createSpace } from './bootstrap'
import fancy from './register-plugins'

const organizationId = process.env.CONTENTFUL_ORGANIZATION_ID!
if (!organizationId) {
  throw new Error('Please provide a `CONTENTFUL_ORGANIZATION_ID`')
}
const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
}

const changesetPath = './changeset.json'
const targetEnvironmentId = 'master'
let testContext: TestContext
let testSpace: Space
before(async () => {
  const client = createClient({ accessToken: cmaToken })
  testSpace = await createSpace(client, organizationId)
  testContext = await createEnvironment(testSpace, targetEnvironmentId)
})

after(async () => {
  if (testSpace) {
    await testSpace.delete()
  }
})

afterEach(async () => {
  await fs.promises.rm(changesetPath, { force: true })
})

describe('create - happy path', () => {
  fancy
    .stdout()
    .runCreateCommand(() => testContext, targetEnvironmentId, cmaToken)
    .it('should not create a changeset when environments are the same', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain(
        'Created a new changeset for 2 environments with 0 source entities and 0 target entities.'
      )
      expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 0 added and 0 changed entries.')
      expect(fs.existsSync(changesetPath)).to.be.true
    })

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
      expect(fs.existsSync(changesetPath)).to.be.true
    })
})
