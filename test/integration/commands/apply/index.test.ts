import { expect } from '@oclif/test'
import { Space, createClient } from 'contentful-management'
import fs from 'fs'
import { ApplyTestContext, TestContext, createEnvironment, createEnvironments } from './../bootstrap'
import fancy from './../register-plugins'

const spaceId = process.env.CONTENTFUL_SPACE_ID!
if (!spaceId) {
  throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
}

const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
}

// Should be dynamically created later.
const changesetFilePath = './changeset.json'
let applyTestContext: ApplyTestContext
let testSpace: Space
let createTestContext: TestContext

before(async () => {
  const client = createClient({ accessToken: cmaToken })
  testSpace = await client.getSpace(spaceId)
  const { environmentId, teardown } = await createEnvironment(testSpace)
  applyTestContext = {
    spaceId: testSpace.sys.id,
    environmentId: environmentId,
    changesetFilePath,
    cmaToken,
    teardown,
  }
  createTestContext = await createEnvironments(testSpace)
})

after(async () => {
  console.log('Deleting test environments ...')
  await Promise.all([applyTestContext.teardown()])
})

describe('Apply command flow', () => {
  // create changeset flow
  // to print the output during testing use `.stdout({ print: true })`
  fancy
    .stdout({ print: true })
    .createTestContentType(() => createTestContext.targetEnvironment)
    .createTestData(() => createTestContext.targetEnvironment, 'entry-1', 'original-title')
    .createTestData(() => createTestContext.targetEnvironment, 'entry-to-be-deleted')
    .createTestContentType(() => createTestContext.sourceEnvironment)
    .createTestData(() => createTestContext.sourceEnvironment, 'entry-1', 'updated-title')
    .createTestData(() => createTestContext.sourceEnvironment, 'new-entry')
    .runCreateCommand(() => createTestContext)
    .it('the changeset was created', () => {
      expect(fs.existsSync('./changeset.json')).to.be.true
    })

  fancy
    .stdout({ print: true })
    .runApplyCommand(() => applyTestContext)
    .it('should add new entries to environment if specified in changeset', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully applied 🎉')
      expect(ctx.stdout).to.contain('Deleted 1/1 entities')
      expect(ctx.stdout).to.contain('Added 1/1 entities')
      expect(ctx.stdout).to.contain('Changed 1/1 entities')
    })
})
