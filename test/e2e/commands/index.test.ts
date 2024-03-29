import { expect } from '@oclif/test'
import { Space, createClient } from 'contentful-management'
import fs from 'fs'
import { ApplyTestContext, TestContext, createEnvironments } from './../../integration/commands/bootstrap'
import fancy from './../../integration/commands/register-plugins'

async function validateUpdatedEntriesInTargetEnvironment(createTestContext: TestContext) {
  const allDataFromTargetEnvironment = await createTestContext.targetEnvironment.getEntries()

  expect(allDataFromTargetEnvironment.total).to.be.equal(2)

  const updatedEntry = allDataFromTargetEnvironment.items.find((entry) => entry.sys.id === 'entry-1')
  const newEntry = allDataFromTargetEnvironment.items.find((entry) => entry.sys.id === 'new-entry')
  const deletedEntry = allDataFromTargetEnvironment.items.find((entry) => entry.sys.id === 'entry-to-be-deleted')

  expect(updatedEntry?.sys.publishedVersion).to.be.equal(3)
  expect(updatedEntry?.sys.version).to.be.equal(4)
  expect(updatedEntry?.fields.title['en-US']).to.be.equal('updated-title')
  expect(newEntry?.sys.publishedVersion).to.be.equal(1)
  expect(deletedEntry).to.be.undefined
}

describe('Command flow - create and apply', () => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID!
  if (!spaceId) {
    throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
  }

  const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
  if (!cmaToken) {
    throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
  }

  const changesetFilePath = './changeset.json'
  let applyTestContext: ApplyTestContext
  let testSpace: Space
  let createTestContext: TestContext

  before(async () => {
    const client = createClient({ accessToken: cmaToken })
    testSpace = await client.getSpace(spaceId)
    const environmentsContext = await createEnvironments(testSpace)
    if (!environmentsContext) {
      throw new Error('Environments were not created successfully')
    }
    createTestContext = environmentsContext
    applyTestContext = {
      spaceId: testSpace.sys.id,
      targetEnvironment: createTestContext.targetEnvironment,
      changesetFilePath,
      cmaToken,
      teardown: environmentsContext.teardown,
    }
  })

  after(async () => {
    await Promise.all([createTestContext.teardown()])
  })

  fancy
    .stdout() // to print the output during testing use `.stdout({ print: true })`
    .createTestContentType(() => createTestContext.targetEnvironment)
    .createTestData(() => createTestContext.targetEnvironment, 'entry-1', 'original-title')
    .createTestData(() => createTestContext.targetEnvironment, 'entry-to-be-deleted')
    .createTestContentType(() => createTestContext.sourceEnvironment)
    .createTestData(() => createTestContext.sourceEnvironment, 'entry-1', 'updated-title')
    .createTestData(() => createTestContext.sourceEnvironment, 'new-entry')
    .runCreateCommand(() => createTestContext)
    .it('the changeset was created', () => {
      expect(fs.existsSync(changesetFilePath)).to.be.true
    })

  fancy
    .stdout()
    .runApplyCommand(() => ({
      ...applyTestContext,
      cmaToken: 'invalid-token',
    }))
    .it('should fail to apply changes with invalid token', async (ctx) => {
      expect(ctx.stdout).to.contain(
        'Error: The CMA token you provided is invalid. Please make sure that your token is correct and not expired.',
      )
    })

  fancy
    .stdout()
    .runApplyCommand(() => applyTestContext)
    .it('should add new entries to environment if specified in changeset', async (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully applied 🎉')
      expect(ctx.stdout).to.contain('1 added entry')
      expect(ctx.stdout).to.contain('1 updated entry')
      expect(ctx.stdout).to.contain('1 deleted entry')

      await validateUpdatedEntriesInTargetEnvironment(createTestContext)
    })
})
