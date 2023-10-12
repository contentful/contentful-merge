import { expect } from '@oclif/test'
import { ApiKey, Space, createClient } from 'contentful-management'
import fs from 'fs'
import { ApplyTestContext, createCdaToken, createEnvironments } from './../bootstrap'
import fancy from './../register-plugins'
import { createChangeset } from '../../../../src/engine/utils/create-changeset'
import addTwoItemsChangeset from './add-2-items-changeset.json'

describe('create command', () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID!
  if (!spaceId) {
    throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
  }
  const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
  if (!cmaToken) {
    throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
  }

  const changesetPath = './changeset.json'
  const changesetPathAddItems = './test/integration/commands/apply/add-2-items-changeset.json'

  let testContext: ApplyTestContext
  let testSpace: Space
  let cdaTokenWithOnlyMasterAccess: ApiKey
  let testContextInvalidToken: ApplyTestContext
  let testContextTwoAdditions: ApplyTestContext

  before(async () => {
    const client = createClient({ accessToken: cmaToken })
    testSpace = await client.getSpace(spaceId)
    const environmentsContext = await createEnvironments(testSpace)

    if (!environmentsContext) {
      throw new Error('Environments were not created successfully')
    }

    testContext = {
      spaceId: testSpace.sys.id,
      targetEnvironment: environmentsContext.targetEnvironment,
      changesetFilePath: changesetPath,
      cmaToken,
      cdaToken: environmentsContext.cdaToken,
      teardown: environmentsContext.teardown,
    }

    testContextTwoAdditions = {
      ...testContext,
      changesetFilePath: changesetPathAddItems,
    }

    addTwoItemsChangeset.sys.target.sys.id = testContext.targetEnvironment.sys.id
    fs.writeFileSync(changesetPathAddItems, JSON.stringify(addTwoItemsChangeset, null, 2))

    testContextInvalidToken = {
      ...testContext,
      changesetFilePath: changesetPathAddItems,
      cmaToken: 'invalid-token',
    }

    const changeset = createChangeset(testContext.targetEnvironment.sys.id, testContext.targetEnvironment.sys.id)
    fs.writeFileSync(changesetPath, JSON.stringify(changeset, null, 2))

    cdaTokenWithOnlyMasterAccess = await createCdaToken(testSpace, ['master'])
  })

  after(async () => {
    await Promise.all([testContext.teardown(), cdaTokenWithOnlyMasterAccess.delete()])
  })

  afterEach(() => fs.promises.rm(changesetPath, { force: true }))

  fancy
    .stdout() // to print the output during testing use `.stdout({ print: true })`
    .runApplyCommand(() => testContext)
    .it('should apply empty changeset', (ctx) => {
      fs.writeFileSync('out', ctx.stdout.toString())

      expect(ctx.stdout).to.contain('Changeset successfully applied 🎉')
      expect(ctx.stdout).to.contain('0 added entries')
      expect(ctx.stdout).to.contain('0 updated entries')
      expect(ctx.stdout).to.contain('0 deleted entries')
    })

  fancy
    .stdout()
    .createTestContentType(() => testContext.targetEnvironment)
    .runApplyCommand(() => testContextTwoAdditions)
    .it('should apply changeset with 2 additions', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully applied 🎉')
      expect(ctx.stdout).to.contain('2 added entries')
      expect(ctx.stdout).to.contain('0 updated entries')
      expect(ctx.stdout).to.contain('0 deleted entries')
    })

  fancy
    .stdout()
    .runApplyCommand(() => testContextInvalidToken)
    .it('should fail applying if token is invalid', (ctx) => {
      expect(ctx.stdout).to.contain('✔ Deleting 0 entries')
      expect(ctx.stdout).to.contain('✖ Adding 2 entries')
      expect(ctx.stdout).to.contain('◼ Updating entries')
      expect(ctx.stdout).to.contain('Error: An error occurred while adding an entry.')
    })
})
