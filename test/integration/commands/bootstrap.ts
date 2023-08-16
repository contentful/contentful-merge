import * as testUtils from '@contentful/integration-test-utils'
import { createClient } from 'contentful'
import { ApiKey, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

const randomId = Math.floor(Math.random() * 10000).toString() // used to prevent concurrency issues

export type TestContext = {
  sourceEnvironment: Environment
  targetEnvironment: Environment
  cdaToken: string
  spaceId: string
  teardown: () => Promise<void>
}

export type ApplyTestContext = {
  environmentId: string
  spaceId: string
  cmaToken: string
  changesetFilePath: string
  teardown: () => Promise<void>
}

export type CreateEnvironmentReturn = Pick<ApplyTestContext, 'teardown' | 'environmentId'>

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

export const createCdaToken = async (
  space: Space,
  environmentIds: string[],
  customAppendix?: string
): Promise<ApiKey> => {
  const apiKeyData: CreateApiKeyProps = {
    name: `CDA Token ${randomId} ${customAppendix ? customAppendix : ''}`,
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

export const createEnvironments = async (testSpace: Space): Promise<TestContext> => {
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + 'source_for_create')
  const targetEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + 'target_for_create')
  const apiKey = await createCdaToken(testSpace, [targetEnvironment.sys.id, sourceEnvironment.sys.id])

  return {
    sourceEnvironment,
    targetEnvironment,
    cdaToken: apiKey.accessToken,
    spaceId: testSpace.sys.id,
    teardown: () => teardown({ apiKey, environments: [sourceEnvironment, targetEnvironment] }),
  }
}

export const createEnvironment = async (testSpace: Space): Promise<CreateEnvironmentReturn> => {
  const environment = await testUtils.createTestEnvironment(testSpace, randomId + 'target_for_apply')
  return {
    teardown: () => teardown({ environments: [environment] }),
    environmentId: environment.sys.id,
  }
}
