const contentful = require('contentful-management')
const {chunk} = require('lodash')

const SPACE = 'lnsjpb79eisl'
const ENVIRONMENT = 'test'

const MAX_ENTRIES = 50000
const LIMIT = 100
const BATCH_SIZE = 7

const client = contentful.createClient({
  accessToken: process.env.CMA_TOKEN,
  space: SPACE,
}, {type: 'plain'})

const PARAMS = {spaceId: SPACE, environmentId: ENVIRONMENT}

async function publishEntries(entryIds) {
  const promises = []
  for (const entryId of entryIds) {
    promises.push(Promise.resolve().then(async () => {
      try {
        const entry = await client.entry.get({...PARAMS, entryId})
        await client.entry.publish({...PARAMS, entryId}, entry)
        console.log('successfully published ' + entryId)
      } catch (e){
        console.log(`failed publishing ${entryId} with ${e.statusText}`)
      }
    }))
  }
  return Promise.all(promises)
}

const run = async () => {
  const ids = []

  console.log(`fetching ${MAX_ENTRIES} in batches of ${LIMIT}`)

  for (let i = 0; i < MAX_ENTRIES / 1000; i++) {
    const result = await client.entry.getMany({
      ...PARAMS,
      query: {
        limit: LIMIT,
        skip: i * LIMIT,
        select: ['sys.id'],
        // 'sys.publishedAt[exists]': true,
        // 'sys.archivedAt[exists]': false,
      },
    })
    ids.push(...result.items.map(item => item.sys.id))
  }

  const idChunks = chunk(ids, BATCH_SIZE)

  for (const chunk of idChunks) {
    console.log(`publishing next chunk of ${chunk.length} entries`)
    try {
      await publishEntries(chunk)
    } catch (e){
     console.log(`failed publishing chunk`)
    }
  }
}

run()
