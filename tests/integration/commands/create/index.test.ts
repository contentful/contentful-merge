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

const setupTestData = async (env: Environment) => {
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
}

describe('create - happy path', () => {
  fancy
    .add('testContext', async () => {
      const client = createClient({ accessToken: cmaToken })
      const testSpace = await setupContentful(client)
      const testContext = await setupEnvironment(testSpace)
      await setupTestData(testContext.sourceEnvironment)

      return testContext
    })
    .stdout()
    .do(async (ctx) => {
      const cmd = new CreateCommand(
        [
          '--space',
          ctx.testContext.spaceId,
          '--source',
          ctx.testContext.sourceEnvironment.sys.id,
          '--target',
          targetEnvironmentId,
          '--cmaToken',
          cmaToken,
          '--cdaToken',
          ctx.testContext.cdaToken,
        ],
        {} as unknown as Config
      ) // hacky.. not a fan
      await cmd.run()
    })
    .finally(() => {
      testUtils.cleanUpTestSpaces({
        threshold: 0,
        dryRun: false,
      })
    })
    .it('should create a changeset when environments differ', (ctx) => {
      // TODO - only passes intermittently, presumably because of the CDN.
      expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
      expect(ctx.stdout).to.contain(
        'Created a new changeset for 2 environments with 1 source entities and 0 target entities.'
      )
      expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 1 added and 0 changed entries.')
      expect(fs.existsSync('./manifest.json')).to.be.true
    })

  // it('should not create a changeset when environments are the same')
})
// })

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
