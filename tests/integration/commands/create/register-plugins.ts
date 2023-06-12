import { fancy } from 'fancy-test'
import { Environment } from 'contentful-management/types'

const setupTestData = async (env: Environment): Promise<any> => {
  // todo fix type
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

export default fancy.register('setupTestData', (getSourceEnvironment) => {
  return {
    async run(ctx: { deleteTestData: any }) {
      // todo fix type
      const deleteTestData = await setupTestData(getSourceEnvironment())
      await new Promise((r) => setTimeout(r, 3000)) // HACK give it some time to let the api settle..

      ctx.deleteTestData = deleteTestData
      return { deleteTestData }
    },
  }
})
