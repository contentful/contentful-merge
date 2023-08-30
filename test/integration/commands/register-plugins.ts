import { Config } from '@oclif/core'
import type { ContentType, Entry, Environment } from 'contentful-management/types'
import { fancy } from 'fancy-test'
import CreateCommand from '../../../src/commands/create'
import ApplyCommand from '../../../src/commands/apply'
import { ApplyTestContext, TestContext } from './bootstrap'

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

const createTestEntry = async (env: Environment, entryId: string, title = 'default title'): Promise<Entry> => {
  const contentTypeId = 'testType'
  let entry = await env.createEntryWithId(contentTypeId, entryId, {
    fields: {
      title: { 'en-US': title },
      description: { 'en-US': "Lovely weather isn't it?" },
    },
  })

  entry = await entry.publish()

  return entry
}

const createTestData = async (env: Environment, entryId: string, title?: string): Promise<() => Promise<unknown>> => {
  const entry = await createTestEntry(env, entryId, title)
  console.log('entry created', entryId)

  return () => Promise.allSettled([entry.unpublish(), entry.delete()])
}

export default fancy
  .register('createTestData', (getSourceEnvironment: () => Environment, entryId: string, title?: string) => {
    // rename to createEntryInEnvironment
    return {
      async run(ctx: { deleteTestData: () => Promise<unknown> }) {
        const deleteTestData = await createTestData(getSourceEnvironment(), entryId, title)

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
  .register('runApplyCommand', (getTestContext: () => ApplyTestContext) => {
    return {
      async run(ctx) {
        const testContext = getTestContext()

        const cmd = new ApplyCommand(
          [
            '--file',
            testContext.changesetFilePath,
            '--space',
            testContext.spaceId,
            '--environment',
            testContext.targetEnvironmentId,
            '--cma-token',
            testContext.cmaToken,
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
