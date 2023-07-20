import { Config } from '@oclif/core'
import type { ContentType, Entry, Environment } from 'contentful-management/types'
import { fancy } from 'fancy-test'
import CreateCommand from '../../../../src/commands/create'
import { TestContext } from './bootstrap'

const createTestContentType = async (env: Environment): Promise<ContentType> => {
  const contentTypeId = 'testType'
  let contentType = await env.createContentTypeWithId(contentTypeId, {
    name: 'Test Type',
    fields: [
      { id: 'title', name: 'Title', type: 'Text', required: true, localized: false },
      { id: 'description', name: 'Description', type: 'Text', required: true, localized: false },
    ],
  })

  contentType = await contentType.publish()

  return contentType
}

const createTestEntry = async (env: Environment): Promise<Entry> => {
  const contentTypeId = 'testType'
  let entry = await env.createEntry(contentTypeId, {
    fields: {
      title: { 'en-US': 'Hello from contentful-merge CLI' },
      description: { 'en-US': "Lovely weather isn't it?" },
    },
  })

  entry = await entry.publish()

  return entry
}

const createTestData = async (env: Environment): Promise<() => Promise<unknown>> => {
  const contentType = await createTestContentType(env)

  const entry = await createTestEntry(env)

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
  .register('createTestContentType', (getEnvironment: () => Environment) => {
    return {
      async run(ctx: { deleteTestData: () => Promise<unknown> }) {
        const contentType = await createTestContentType(getEnvironment())

        ctx.deleteTestData = () => Promise.allSettled([contentType.unpublish(), contentType.delete()])
      },
    }
  })
  .register('runCreateCommand', (getTestContext: () => TestContext, getApiKey?: () => string) => {
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
            testContext.targetEnvironment.sys.id,
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
  })
