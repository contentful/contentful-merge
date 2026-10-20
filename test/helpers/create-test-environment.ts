import type { Environment, Space } from 'contentful-management'

export const createTestEnvironment = async (
  space: Pick<Space, 'createEnvironment' | 'getEnvironment'>,
  name: string,
): Promise<Environment> => {
  if (name.length > 40) {
    throw new Error(`Environment name exceeds 40 characters: ${name}`)
  }

  const created = await space.createEnvironment({ name })
  for (let elapsed = 0; elapsed <= 5 * 60 * 1000; elapsed += 1000) {
    const environment = await space.getEnvironment(created.sys.id)
    if (environment.sys.status.sys.id === 'ready') {
      return environment
    }
    console.log(`Environment ${created.sys.id} is not ready yet. Waiting 1000ms...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`Environment ${created.sys.id} was not ready after five minutes`)
}
