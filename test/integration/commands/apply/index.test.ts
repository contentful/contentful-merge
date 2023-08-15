import { expect } from '@oclif/test'
import { Environment, Space, createClient } from 'contentful-management'
import fs from 'fs'
import { ApplyTestContext, TestContext, createEnvironment } from './../bootstrap'
import fancy from './../register-plugins'
import path from 'path'

const spaceId = process.env.CONTENTFUL_SPACE_ID!
if (!spaceId) {
  throw new Error('Please provide a `CONTENTFUL_SPACE_ID`')
}

const cmaToken = process.env.CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide a `CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN`')
}

// Should be dynamically created later.
const changesetFilePath = path.join(__dirname, './changesets/1-add-entry.json')
console.log({ changesetFilePath })
let testContext: ApplyTestContext
let testSpace: Space

before(async () => {
  const client = createClient({ accessToken: cmaToken })
  testSpace = await client.getSpace(spaceId)
  const { environmentId, teardown } = await createEnvironment(testSpace)
  testContext = {
    spaceId: testSpace.sys.id,
    environmentId: environmentId,
    changesetFilePath,
    cmaToken,
    teardown,
  }
})

after(async () => {
  console.log('Deleting test environments ...')
  await Promise.all([testContext.teardown()])
})

describe('create - happy path', () => {
  fancy
    .stdout() // to print the output during testing use `.stdout({ print: true })`
    .runApplyCommand(() => testContext)
    .it('should add new entries to environment if specified in changeset', (ctx) => {
      console.log('ctx.stout', ctx.stdout)
      console.dir({ ctx }, { depth: null })
      expect(ctx.stdout).to.contain('Changeset successfully applied 🎉')
      // TODO Test that the data actually exists (e.g. by fetching via client)
    })
})
