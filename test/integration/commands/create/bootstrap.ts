import * as testUtils from '@contentful/integration-test-utils'
import { ClientAPI, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

export type TestContext = {
  sourceEnvironment: Environment
  cdaToken: string
  spaceId: string
}

export const createCdaToken = async (space: Space, environmentIds: string[]): Promise<string> => {
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

export const createSpace = async (client: ClientAPI, organizationId: string): Promise<Space> => {
  const testSpace = await testUtils.createTestSpace({
    client,
    organizationId,
    repo: 'CLI',
    language: 'JS',
    testSuiteName: 'CCCCLI Int Tests',
  })

  return testSpace
}

export const createEnvironment = async (testSpace: Space, targetEnvironmentId: string): Promise<TestContext> => {
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, 'test-id')

  return {
    sourceEnvironment,
    cdaToken: await createCdaToken(testSpace, [targetEnvironmentId, sourceEnvironment.sys.id]),
    spaceId: testSpace.sys.id,
  }
}
