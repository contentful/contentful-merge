// TODO - CMA token specified twice due to enforced naming convention of '@contentful/integration-test-utils'

import { ClientAPI, CreateApiKeyProps, Environment, MetaLinkProps, Space, createClient } from 'contentful-management'
import * as testUtils from '@contentful/integration-test-utils'
import { expect, test } from '@oclif/test'
import fs from 'fs'

const organizationId = process.env.ORG_ID!
if (!organizationId) {
  throw new Error('Please provide an `ORG_ID`')
}
const cmaToken = process.env.CMA_TOKEN!
if (!cmaToken) {
  throw new Error('Please provide an `CMA_TOKEN`')
}

const targetEnvId = 'master'
let sourceEnvId = ''
let spaceId = ''
let cdaToken = ''

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

const setupContentful = async (client: ClientAPI): Promise<Environment> => {
  const testSpace = await testUtils.createTestSpace({
    client,
    organizationId,
    repo: 'CLI',
    language: 'JS',
    testSuiteName: 'CCCCLI Int Tests',
  })

  const testEnvironment = await testUtils.createTestEnvironment(testSpace, 'whatever-it-gets-ignored-anyway')

  // store generated ids - TODO make this cleaner
  spaceId = testSpace.sys.id
  sourceEnvId = testEnvironment.sys.id
  cdaToken = await createCdaToken(testSpace, [targetEnvId, testEnvironment.sys.id])

  return testEnvironment
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
  before(async () => {
    const client = createClient({ accessToken: cmaToken })
    const testEnvironment = await setupContentful(client)
    await setupTestData(testEnvironment)
  })

  after(async () => {
    await testUtils.cleanUpTestSpaces({
      threshold: 0,
      dryRun: false,
    })
  })

  it('cmd', () => {
    test
      .stdout()
      .command([
        'create',
        '--space',
        spaceId,
        '--source',
        sourceEnvId,
        '--target',
        targetEnvId,
        '--cmaToken',
        cmaToken,
        '--cdaToken',
        cdaToken,
      ])
      .it('should create a changeset when environments differ', (ctx) => {
        expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
        expect(ctx.stdout).to.contain(
          'Created a new changeset for 2 environments with 1 source entities and 0 target entities.'
        )
        expect(ctx.stdout).to.contain('The resulting changeset has 0 removed, 1 added and 0 changed entries.')
        expect(fs.existsSync('manifest.json')).to.be.true
      })

    // it('should not create a changeset when environments are the same')
  })
})

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
