const contentful = require('contentful-management')

const SPACE = 'lnsjpb79eisl'
const ENVIRONMENT = 'test-clone'
const CONTENT_TYPE = 'content'

const client = contentful.createClient(
  {
    accessToken: process.env.CMA_TOKEN,
    space: SPACE,
  },
  { type: 'plain' },
)

const updateAndPublishContent = async ({ title, content, id }) => {
  const params = {
    environmentId: ENVIRONMENT,
    spaceId: SPACE,
  }

  let entry = await client.entry.get({
    spaceId: SPACE,
    environmentId: ENVIRONMENT,
    entryId: id,
  })

  entry.fields.title['en-US'] = title
  entry.fields.content['en-US'] = content

  entry = await client.entry.update(
    {
      spaceId: SPACE,
      environmentId: ENVIRONMENT,
      entryId: entry.sys.id,
    },
    entry,
  )

  await client.entry.publish(
    {
      spaceId: SPACE,
      environmentId: ENVIRONMENT,
      entryId: entry.sys.id,
    },
    entry,
  )
}

const content = `
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`

const run = async () => {
  const entries = await client.entry.getMany({
    environmentId: ENVIRONMENT,
    spaceId: SPACE,
    query: {
      content_type: CONTENT_TYPE,
      limit: 100,
      skip: 100,
    },
  })

  for (const entry of entries.items) {
    console.log('update ' + entry.fields.title['en-US'])
    await updateAndPublishContent({
      id: entry.sys.id,
      content,
      title: 'Changed ' + entry.fields.title['en-US'],
    })
  }
}

run()
