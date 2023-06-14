import * as testUtils from '@contentful/integration-test-utils'
import { ApiKey, ClientAPI, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

export type TestContext = {
  sourceEnvironment: Environment
  cdaToken: string
  spaceId: string
  teardown: () => Promise<void>
}

export const createCdaToken = async (space: Space, environmentIds: string[]): Promise<ApiKey> => {
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
  return await space.createApiKey(apiKeyData)
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

const teardown = async (apiKey: ApiKey, environment: Environment): Promise<void> => {
  await Promise.allSettled([apiKey.delete(), environment.delete()])
}

export const createEnvironment = async (testSpace: Space, targetEnvironmentId: string): Promise<TestContext> => {
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, 'test-id')
  const apiKey = await createCdaToken(testSpace, [targetEnvironmentId, sourceEnvironment.sys.id])

  return {
    sourceEnvironment,
    cdaToken: apiKey.accessToken,
    spaceId: testSpace.sys.id,
    teardown: () => teardown(apiKey, sourceEnvironment),
  }
}
