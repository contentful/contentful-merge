import { fancy } from 'fancy-test'
import { Environment } from 'contentful-management/types'
import CreateCommand from '../../../../src/commands/create'
import { TestContext } from './bootstrap'
import { Config } from '@oclif/core'

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
  entry.publish()

  return () => Promise.allSettled([entry.unpublish(), entry.delete(), contentType.unpublish(), contentType.delete()])
}

export default fancy
  .register('createTestData', (getSourceEnvironment: () => Environment) => {
    return {
      async run(ctx: { deleteTestData: () => Promise<unknown> }) {
        const deleteTestData = await createTestData(getSourceEnvironment())
        await new Promise((r) => setTimeout(r, 5000)) // HACK give it some time to let the api settle..

        ctx.deleteTestData = deleteTestData
        return { deleteTestData }
      },
    }
  })
  .register('runCreateCommand', (getTestContext: () => TestContext, targetEnvironmentId: string, cmaToken: string) => {
    return {
      async run(ctx) {
        await new Promise((r) => setTimeout(r, 3000)) // HACK give it some time to let the api settle..

        const testContext = getTestContext()
        const cmd = new CreateCommand(
          [
            '--space',
            testContext.spaceId,
            '--source',
            testContext.sourceEnvironment.sys.id,
            '--target',
            targetEnvironmentId,
            '--cmaToken',
            cmaToken,
            '--cdaToken',
            testContext.cdaToken,
          ],
          {} as unknown as Config // Runtime variables, but not required for tests.
        )
        await cmd.run()
      },
    }
  })
