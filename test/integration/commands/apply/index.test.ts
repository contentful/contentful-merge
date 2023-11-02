import { expect } from '@oclif/test'
import { ApiKey, Space, createClient } from 'contentful-management'
import fs from 'fs'
import { ApplyTestContext, createCdaToken, createEnvironments } from './../bootstrap'
import fancy from './../register-plugins'
import { createChangeset } from '../../../../src/engine/utils/create-changeset'
import { createAddTwoItemsChangeset } from '../fixtures/add-two-items-changeset'

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
  const changesetPathAddItems = './add-two-items-changeset.json'

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

    const addTwoItemsChangeset = createAddTwoItemsChangeset(
      environmentsContext.sourceEnvironment.sys.id,
      testContext.targetEnvironment.sys.id,
      testSpace.sys.id,
    )

    testContextInvalidToken = {
      ...testContext,
      changesetFilePath: changesetPathAddItems,
      cmaToken: 'invalid-token',
    }

    const changeset = createChangeset(
      testContext.targetEnvironment.sys.id,
      testContext.targetEnvironment.sys.id,
      testContext.spaceId,
    )

    fs.writeFileSync(changesetPath, JSON.stringify(changeset, null, 2))
    fs.writeFileSync(changesetPathAddItems, JSON.stringify(addTwoItemsChangeset, null, 2))

    cdaTokenWithOnlyMasterAccess = await createCdaToken(testSpace, ['master'])
  })

  after(async () => {
    await Promise.all([
      testContext.teardown(),
      cdaTokenWithOnlyMasterAccess.delete(),
      fs.promises.rm(changesetPath, { force: true }),
      fs.promises.rm(changesetPathAddItems, { force: true }),
    ])
  })

  fancy
    .stdout() // to print the output during testing use `.stdout({ print: true })`
    .runApplyCommand(() => testContext)
    .it('should apply empty changeset', (ctx) => {
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
      expect(ctx.stdout).to.contain(
        'Error: The CMA token you provided is invalid. Please make sure that your token is correct and not expired.',
      )
    })
})
