import { ClientAPI, CreateApiKeyProps, Environment, MetaLinkProps, Space, createClient } from 'contentful-management'
import * as testUtils from '@contentful/integration-test-utils'
import { Config, expect, test } from '@oclif/test'
import fs from 'fs'
import { fancy } from 'fancy-test'
import CreateCommand from '../../../../src/commands/create'

const organizationId = process.env.ORG_ID!
if (!organizationId) {
  throw new Error('Please provide an `ORG_ID`')
}
const cmaToken = process.env.CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide an `CMA_TOKEN`')
}

const targetEnvironmentId = 'master'

// TODO move these functions out of the test
const createCdaToken = async (space: Space, environmentIds: string[]): Promise<string> => {
  const apiKeyData: CreateApiKeyProps = {
    name: 'CCCCLI CDA Token',
    environments: environmentIds.map((envId) => ({
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: envId,
      },
    })),
  }
  const apiKey = await space.createApiKey(apiKeyData)
  const cdaToken = apiKey.accessToken

  return cdaToken
}

const setupContentful = async (client: ClientAPI): Promise<Space> => {
  const testSpace = await testUtils.createTestSpace({
    client,
    organizationId,
    repo: 'CLI',
    language: 'JS',
    testSuiteName: 'CCCCLI Int Tests',
  })

  return testSpace
}

type TestContext = {
  sourceEnvironment: Environment
  cdaToken: string
  spaceId: string
}

const setupEnvironment = async (testSpace: Space): Promise<TestContext> => {
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, 'whatever-it-gets-ignored-anyway') // TODO not sure why, but an ID gets generated.

  return {
    sourceEnvironment,
    cdaToken: await createCdaToken(testSpace, [targetEnvironmentId, sourceEnvironment.sys.id]),
    spaceId: testSpace.sys.id,
  }
}

const setupTestData = async (env: Environment): Promise<() => void> => {
  const contentType = await env.createContentType({
    name: 'TestType',
    fields: [
      { id: 'title', name: 'Title', type: 'Text', required: true, localized: false },
      { id: 'description', name: 'Description', type: 'Text', required: true, localized: false },
    ],
  })

  await contentType.publish()

  const entry = await env.createEntry(contentType.sys.id, {
    fields: {
      title: { 'en-US': 'Hello from CCCCLI' },
      description: { 'en-US': "Lovely weather isn't it?" },
    },
  })
  entry.publish()

  return () => Promise.allSettled([entry.delete(), contentType.delete()])
}

let testContext: TestContext
before(async () => {
  const client = createClient({ accessToken: cmaToken })
  const testSpace = await setupContentful(client)
  const context = await setupEnvironment(testSpace)

  testContext = context
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
    .add('data', async () => {
      const deleteTestData = await setupTestData(testContext.sourceEnvironment)

      return { deleteTestData }
    })
    .do(async () => {
      await new Promise((r) => setTimeout(r, 3000)) // HACK give it some time to let the api settle..

      // TODO - this could be a 'plugin'
      const cmd = new CreateCommand(
        [
          '--space',
          testContext.spaceId,
          '--source',
          testContext.sourceEnvironment.sys.id,
          '--target',
          targetEnvironmentId,
          '--cmaToken',
          cmaToken,
          '--cdaToken',
          testContext.cdaToken,
        ],
        {} as unknown as Config // Runtime variables, but not required for tests.
      )
      await cmd.run()
    })
    .finally(async (ctx) => {
      // TODO could be a plugin
      await ctx.data.deleteTestData()
    })
    .it('should create a changeset when environments differ', (ctx) => {
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain(
        'Created a new changeset for 2 environments with 1 source entities and 0 target entities.'
      )
      expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 1 added and 0 changed entries.')
      expect(fs.existsSync('./changeset.json')).to.be.true
    })

  // fancy
  //   .stdout()
  //   .do(async () => {
  //     await new Promise((r) => setTimeout(r, 3000)) // HACK give it some time to let the api settle..

  //     // TODO - this could be a 'plugin'
  //     const cmd = new CreateCommand(
  //       [
  //         '--space',
  //         testContext.spaceId,
  //         '--source',
  //         testContext.sourceEnvironment.sys.id,
  //         '--target',
  //         targetEnvironmentId,
  //         '--cmaToken',
  //         cmaToken,
  //         '--cdaToken',
  //         testContext.cdaToken,
  //       ],
  //       {} as unknown as Config // Runtime variables, but not required for tests.
  //     )
  //     await cmd.run()
  //   })
  //   .it('should not create a changeset when environments are the same', (ctx) => {
  //     expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
  //     expect(ctx.stdout).to.contain(
  //       'Created a new changeset for 2 environments with 0 source entities and 0 target entities.'
  //     )
  //     expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 0 added and 0 changed entries.')
  //     expect(fs.existsSync('./changeset.json')).to.be.true
  //   })
})

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
