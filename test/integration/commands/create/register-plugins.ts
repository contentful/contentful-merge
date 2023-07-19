import { Config } from '@oclif/core'
import { ApiKey, Environment } from 'contentful-management/types'
import { fancy } from 'fancy-test'
import CreateCommand from '../../../../src/commands/create'
import { TestContext } from './bootstrap'

const createTestData = async (env: Environment): Promise<() => Promise<unknown>> => {
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
  await entry.publish()

  return () => Promise.allSettled([entry.unpublish(), entry.delete(), contentType.unpublish(), contentType.delete()])
}

export default fancy
  .register('createTestData', (getSourceEnvironment: () => Environment) => {
    return {
      async run(ctx: { deleteTestData: () => Promise<unknown> }) {
        const deleteTestData = await createTestData(getSourceEnvironment())

        ctx.deleteTestData = deleteTestData
      },
    }
  })
  .register(
    'runCreateCommand',
    (getTestContext: () => TestContext, targetEnvironmentId: string, getApiKey?: () => string) => {
      return {
        async run(ctx) {
          await new Promise((r) => setTimeout(r, 3000)) // Workaround: Give API changes time to settle

          const testContext = getTestContext()
          const cdaToken = getApiKey ? getApiKey() : undefined

          const cmd = new CreateCommand(
            [
              '--space',
              testContext.spaceId,
              '--source',
              testContext.sourceEnvironment.sys.id,
              '--target',
              targetEnvironmentId,
              '--cda-token',
              cdaToken || testContext.cdaToken,
            ],
            {} as unknown as Config // Runtime config, but not required for tests.
          )
          try {
            await cmd.run()
          } catch (e) {
            console.log(e)
          }
        },
      }
    }
  )
