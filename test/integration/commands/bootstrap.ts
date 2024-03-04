import * as testUtils from '@contentful/integration-test-utils'
import { createClient } from 'contentful'
import { ApiKey, Environment } from 'contentful-management'
import { CreateApiKeyProps, Space } from 'contentful-management/types'

export const CDA_ACCESS_TOKEN_FOR_TEST = '5HAbGYZ6iZWiDXGxMtvsrW'
export const CDA_ACCESS_TOKEN_MASTER_FOR_TEST = '5DH7JdIDD4k6sF05Z3VPe2'

export type TestContext = {
  sourceEnvironment: Environment
  targetEnvironment: Environment
  cdaToken: string
  spaceId: string
  teardown: () => Promise<void>
  changesetFilePath: string
}

export type ApplyTestContext = {
  targetEnvironment: Environment
  spaceId: string
  cmaToken: string
  cdaToken?: string
  changesetFilePath: string
  teardown: () => Promise<void>
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

export const updateCdaToken = async (cdaTokenId: string, space: Space, environmentIds: string[]): Promise<ApiKey> => {
  console.log('fetching api key...')
  let apiKey: ApiKey

  try {
    apiKey = await space.getApiKey(cdaTokenId)

    environmentIds.forEach((envId) => {
      apiKey.environments.push({
        sys: {
          type: 'Link',
          linkType: 'Environment',
          id: envId,
        },
      })
    })

    await apiKey.update()
  } catch (e) {
    console.log('failed to fetch key', e)
    apiKey = await createCdaToken(space, environmentIds)
  }

  return apiKey
}

const removeEnvironmentsFromKey = async (apiKey: ApiKey, environments: Environment[]) => {
  if (apiKey.sys.id !== CDA_ACCESS_TOKEN_FOR_TEST) {
    await apiKey.delete()
  }

  apiKey.environments = apiKey.environments.filter((env) => !environments.map((e) => e.sys.id).includes(env.sys.id))
  await apiKey.update()
}

const teardown = async ({ apiKey, environments }: { apiKey?: ApiKey; environments: Environment[] }): Promise<void> => {
  await Promise.allSettled([
    apiKey && removeEnvironmentsFromKey(apiKey, environments),
    ...environments.map((env) => env.delete()),
  ])
}

export const createEnvironments = async (testSpace: Space): Promise<TestContext | undefined> => {
  const randomId = Math.floor(Math.random() * 10000).toString() // used to prevent concurrency issues
  console.log('creating source environment...')
  const sourceEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + '_source_environment')
  console.log('creating target environment...')
  const targetEnvironment = await testUtils.createTestEnvironment(testSpace, randomId + '_target_environment')
  console.log('obtaining API keys...')
  const apiKey = await updateCdaToken(CDA_ACCESS_TOKEN_FOR_TEST, testSpace, [
    targetEnvironment.sys.id,
    sourceEnvironment.sys.id,
  ])
  console.log('setup finished\n')

  return {
    changesetFilePath: './changeset.json',
    sourceEnvironment,
    targetEnvironment,
    cdaToken: apiKey.accessToken,
    spaceId: testSpace.sys.id,
    teardown: () => teardown({ apiKey, environments: [sourceEnvironment, targetEnvironment] }),
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
