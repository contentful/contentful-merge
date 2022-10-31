import axios from 'axios'
import {createHttpClient} from 'contentful-sdk-core'
import {Entry, EntryCollection} from 'contentful'
import {pickBy} from 'lodash'

type CreateClientParams = {
  space: string, accessToken: string
}

type PageAbleParam = {
  skip?: number
  limit?: number
}

type ParamEnvironment = {
  environment: string
}

type EntriesQuery = {
  select?: Array<string>
}

type GetEntriesParams = ParamEnvironment &  { query?: EntriesQuery & PageAbleParam }
type GetEntryParams = ParamEnvironment &  { entryId:string, query?: EntriesQuery }

const cleanQuery = (query?: Record<string, any>) => pickBy(query, v => v !== undefined)

export const createClient = ({space, accessToken}: CreateClientParams) => {
  const client = createHttpClient(axios, {
    accessToken,
    space,
    throttle: 'auto',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.contentful.delivery.v1+json',
    },
    baseURL: `https://cdn.contentful.com/spaces/${space}/environments/`,
  })

  return {
    entries: {
      getMany: async ({environment, query}: GetEntriesParams) => {
        const result = await client.get(`${environment}/entries`, {
          params: {...cleanQuery(query)},
        })
        return result.data as EntryCollection<any>
      },
      get: async ({environment, entryId, query}: GetEntryParams) => {
        const result = await client.get(`${environment}/entries/${entryId}`, {
          params: {...cleanQuery(query)},
        })
        return result.data as Entry<any>
      },
    },
  }
}
