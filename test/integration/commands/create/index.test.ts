import { expect } from '@oclif/test'
import { ApiKey, Space, createClient } from 'contentful-management'
import fs from 'fs'
import { TestContext, createCdaToken, createEnvironments } from './../bootstrap'
import fancy from './../register-plugins'

const spaceId = process.env.CONTENTFUL_SPACE_ID!
if (!spaceId) {
  throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
}
const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
}

const changesetPath = './changeset.json'
let testContext: TestContext
let testSpace: Space
let cdaTokenWithOnlyMasterAccess: ApiKey
before(async () => {
  const client = createClient({ accessToken: cmaToken })
  testSpace = await client.getSpace(spaceId)
  testContext = await createEnvironments(testSpace)
  cdaTokenWithOnlyMasterAccess = await createCdaToken(testSpace, ['master'], 'Master Only CDA Key')
})

after(async () => {
  console.log('Deleting test environments and api keys ...')
  await Promise.all([testContext.teardown(), cdaTokenWithOnlyMasterAccess.delete()])
})

afterEach(() => fs.promises.rm(changesetPath, { force: true }))

describe('create - happy path', () => {
  fancy
    .stdout() // to print the output during testing use `.stdout({ print: true })`
    .runCreateCommand(() => testContext)
    .it('should create an empty changeset when both environments are empty', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain('0 entries detected in the source environment')
      expect(ctx.stdout).to.contain('0 entries detected in the target environment')
      expect(ctx.stdout).to.contain('0 added entries')
      expect(ctx.stdout).to.contain('0 updated entries')
      expect(ctx.stdout).to.contain('0 deleted entries')
      expect(fs.existsSync(changesetPath)).to.be.true
    })

  fancy
    .stdout()
    .createTestContentType(() => testContext.targetEnvironment)
    .createTestData(() => testContext.sourceEnvironment, 'new-entry')
    .runCreateCommand(() => testContext)
    .finally(async (ctx) => {
      await ctx.deleteTestData()
    })
    .it('should create a changeset when environment has additions', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain('1 entry detected in the source environment')
      expect(ctx.stdout).to.contain('0 entries detected in the target environment')
      expect(ctx.stdout).to.contain('1 added entry')
      expect(ctx.stdout).to.contain('0 updated entries')
      expect(ctx.stdout).to.contain('0 deleted entries')
      expect(fs.existsSync(changesetPath)).to.be.true
    })
})

describe('create - fails', () => {
  fancy
    .stdout()
    .runCreateCommand(
      () => testContext,
      () => 'invalid-cda-token'
    )
    .it('fails and informs on 401 (invalid token)', (ctx) => {
      expect(ctx.stdout).to.contain('Request failed with status code 401')
    })

  fancy
    .stdout()
    .runCreateCommand(
      () => testContext,
      () => cdaTokenWithOnlyMasterAccess.accessToken
    )
    .it('fails and informs on 404', (ctx) => {
      expect(ctx.stdout).to.contain('Request failed with status code 404')
    })
})
