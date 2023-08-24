import * as testUtils from '@contentful/integration-test-utils'
import { createClient } from 'contentful'
import { ApiKey, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

export type TestContext = {
  sourceEnvironment: Environment
  targetEnvironment: Environment
  cdaToken: string
  spaceId: string
  teardown: () => Promise<void>
}

export type ApplyTestContext = {
  targetEnvironmentId: string
  spaceId: string
  cmaToken: string
  changesetFilePath: string
}

const waitForKeyReady = async (apiKey: ApiKey): Promise<void> => {
  const client = createClient({
    accessToken: apiKey.accessToken,
    space: apiKey.sys.space!.sys.id,
    environment: apiKey.environments[0].sys.id,
  })

  const retries = 10
  for (let i = 0; i < retries; i++)
    try {
      await client.getEntries()
      return
    } catch {
      const delayTime = Math.floor(1000 * 1.5 ** i)
      console.log(`CDA key not ready, retrying in ${delayTime}ms`)
      await new Promise((r) => setTimeout(r, delayTime))
    }

  throw new Error('Failed to create a working CDA key.')
}

export const createCdaToken = async (space: Space, environmentIds: string[]): Promise<ApiKey> => {
  const uniqueTokenName = Math.floor(Math.random() * 10000).toString()
  const apiKeyData: CreateApiKeyProps = {
    name: `CDA Token ${uniqueTokenName}`,
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

const teardown = async ({ apiKey, environments }: { apiKey?: ApiKey; environments: Environment[] }): Promise<void> => {
  await Promise.allSettled([apiKey && apiKey.delete(), ...environments.map((env) => env.delete())])
}

export const createEnvironments = async (testSpace: Space): Promise<TestContext | undefined> => {
  try {
    const randomId = Math.floor(Math.random() * 10000).toString() // used to prevent concurrency issues
    console.log('creating source environment...')
    const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + '_source_environment')
    console.log('creating target environment...')
    const targetEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + '_target_environment')
    console.log('creating API keys...')
    const apiKey = await createCdaToken(testSpace, [targetEnvironment.sys.id, sourceEnvironment.sys.id])
    console.log('all setup')
    return {
      sourceEnvironment,
      targetEnvironment,
      cdaToken: apiKey.accessToken,
      spaceId: testSpace.sys.id,
      teardown: () => teardown({ apiKey, environments: [sourceEnvironment, targetEnvironment] }),
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const createEnvironment = async (testSpace: Space) => {
  const randomId = Math.floor(Math.random() * 10000).toString() // used to prevent concurrency issues
  const environment = await testUtils.createTestEnvironment(testSpace, randomId + 'target_for_apply')
  return {
    teardown: () => teardown({ environments: [environment] }),
    environmentId: environment.sys.id,
  }
}
