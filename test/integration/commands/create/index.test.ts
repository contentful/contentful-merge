import { expect } from '@oclif/test'
import { Space, createClient } from 'contentful-management'
import fs from 'fs'
import { TestContext, createEnvironments } from './../bootstrap'
import fancy from './../register-plugins'

describe('create - happy path', () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID!
  if (!spaceId) {
    throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
  }
  const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
  if (!cmaToken) {
    throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
  }

  const changesetPath = './create-changeset.json'
  let testContext: TestContext
  let testSpace: Space
  // let cdaTokenWithOnlyMasterAccess: ApiKey
  before(async () => {
    console.log('before hook: create command: starting')
    const client = createClient({ accessToken: cmaToken })
    testSpace = await client.getSpace(spaceId)
    const environmentsContext = await createEnvironments(testSpace)
    if (!environmentsContext) {
      throw new Error('Environments were not created successfully')
    }
    // cdaTokenWithOnlyMasterAccess = await createCdaToken(testSpace, ['master', 'another'])
    console.log('before hook: create command: finished')
  })

  after(async () => {
    console.log('Deleting test environments and api keys ...')
    await Promise.all([testContext.teardown()])
  })

  afterEach(() => fs.promises.rm(changesetPath, { force: true }))
  fancy
    .stdout({ print: true }) // to print the output during testing use `.stdout({ print: true })`
    .runCreateCommand(() => testContext)
    .it('should create an empty changeset when both environments are empty', (ctx) => {
      console.log(ctx.stdout)
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

// describe('create - fails', () => {
//   fancy
//     .stdout()
//     .runCreateCommand(
//       () => testContext,
//       () => 'invalid-cda-token'
//     )
//     .it('fails and informs on 401 (invalid token)', (ctx) => {
//       expect(ctx.stdout).to.contain('Request failed with status code 401')
//     })

//   fancy
//     .stdout()
//     .runCreateCommand(
//       () => testContext,
//       () => cdaTokenWithOnlyMasterAccess.accessToken
//     )
//     .it('fails and informs on 404', (ctx) => {
//       expect(ctx.stdout).to.contain('Request failed with status code 404')
//     })
// })
