const contentful = require('contentful-management')

const SPACE = 'lnsjpb79eisl'
const ENVIRONMENT = 'test'
const CONTENT_TYPE = 'content'

const client = contentful.createClient({
  accessToken: process.env.CMA_TOKEN,
  space: SPACE,
}, {type: 'plain'})

const createAndPublishPage = async ({title, content, index}) => {
  const params = {
    environmentId: ENVIRONMENT,
    spaceId: SPACE,
    contentTypeId: CONTENT_TYPE,
  }

  const entry = await client.entry.create(params, {
    fields: {
      title: {"en-US": title},
      content: {"en-US": content},
      index: {"en-US": index}
    },
  })

  await client.entry.publish({
    spaceId: SPACE,
    environmentId: ENVIRONMENT,
    entryId: entry.sys.id
  }, entry)
}



const run = async () => {
  for (let i = 100; i < 5000; i++) {
    console.log(i)
    await createAndPublishPage({
      index: i, content: 'Hello World', title: 'Index '  + i,
    })
  }
}

run()
