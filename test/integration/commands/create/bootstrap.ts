import * as testUtils from '@contentful/integration-test-utils'
import { createClient } from 'contentful'
import { ApiKey, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

const randomId = Math.floor(Math.random() * 10000).toString() // used to prevent concurrency issues

export type TestContext = {
  sourceEnvironment: Environment
  cdaToken: string
  spaceId: string
  teardown: () => Promise<void>
}

const waitForKeyReady = async (apiKey: ApiKey): Promise<void> => {
  const client = createClient({ accessToken: apiKey.accessToken, space: apiKey.sys.space!.sys.id })

  const retries = 5
  for (let i = 0; i < retries; i++)
    try {
      await client.getEntries()
      return
    } catch {
      const delayTime = 1000 * 2 ** i
      console.log(`CDA key not ready, retrying in ${delayTime}ms`)
      await new Promise((r) => setTimeout(r, delayTime))
    }

  throw new Error('Failed to create a working CDA key.')
}

export const createCdaToken = async (space: Space, environmentIds: string[]): Promise<ApiKey> => {
  const apiKeyData: CreateApiKeyProps = {
    name: `CDA Token ${randomId}`,
    environments: environmentIds.map((envId) => ({
      sys: {
        type: 'Link',
        linkType: 'Environment',
        id: envId,
      },
    })),
  }
  const apiKey = await space.createApiKey(apiKeyData)
  await waitForKeyReady(apiKey)

  return apiKey
}

const teardown = async (apiKey: ApiKey, environment: Environment): Promise<void> => {
  await Promise.allSettled([apiKey.delete(), environment.delete()])
}

export const createEnvironment = async (testSpace: Space, targetEnvironmentId: string): Promise<TestContext> => {
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, randomId)
  const apiKey = await createCdaToken(testSpace, [targetEnvironmentId, sourceEnvironment.sys.id])

  return {
    sourceEnvironment,
    cdaToken: apiKey.accessToken,
    spaceId: testSpace.sys.id,
    teardown: () => teardown(apiKey, sourceEnvironment),
  }
}
