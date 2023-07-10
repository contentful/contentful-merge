import axios from 'axios'
import { Entry, EntryCollection } from 'contentful'
import { EntryProps } from 'contentful-management'
import { createHttpClient, getUserAgentHeader } from 'contentful-sdk-core'
import { pickBy } from 'lodash'
import { ClientLogHandler } from '../logger/types'
import { stripSys } from '../utils/strip-sys'

import ContentfulSdkCorePKGJson from 'contentful-sdk-core/package.json'

type CreateClientParams = {
  space: string
  cdaToken: string
  cmaToken: string
  logHandler: ClientLogHandler
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

export type GetEntriesParams = ParamEnvironment & { query?: EntriesQuery & PageAbleParam & Record<string, any> }
type GetEntryParams = ParamEnvironment & { entryId: string; query?: EntriesQuery }
type DeleteEntryParams = ParamEnvironment & { entryId: string }
type CreateEntryParams = ParamEnvironment & { entryId: string; contentType: string; entry: Omit<EntryProps, 'sys'> }
type UpdateEntryParams = ParamEnvironment & { entryId: string; contentType: string; entry: EntryProps }
type PublishEntryParams = ParamEnvironment & { entryId: string; entry: EntryProps }

const cleanQuery = (query?: Record<string, any>) => pickBy(query, (v) => v !== undefined)

const SDK = `contentful-sdk-core/${ContentfulSdkCorePKGJson.version}`
const VERSION = '0.0.0'
const FEATURE = 'merge-library'
const APPLICATION = `contentful-merge/${VERSION}`
const INTEGRATION = 'cli'
const USER_AGENT = getUserAgentHeader(SDK, APPLICATION, INTEGRATION, FEATURE)

export const createClient = ({
  space,
  cdaToken,
  cmaToken,
  logHandler,
  sequenceKey,
}: CreateClientParams & { sequenceKey: string }) => {
  const cdaClient = createHttpClient(axios, {
    accessToken: cdaToken,
    space,
    throttle: 30,
    headers: {
      Authorization: `Bearer ${cdaToken}`,
      'Content-Type': 'application/vnd.contentful.delivery.v1+json',
      'CF-Sequence': sequenceKey,
      'X-Contentful-User-Agent': USER_AGENT,
    },
    baseURL: `https://cdn.contentful.com/spaces/${space}/environments/`,
    logHandler: (level, data) => logHandler(level, `CDA ${data}`),
  })

  const cmaClient = createHttpClient(axios, {
    accessToken: cmaToken,
    space,
    throttle: 'auto',
    headers: {
      Authorization: `Bearer ${cmaToken}`,
      'Content-Type': 'application/vnd.contentful.management.v1+json',
      'CF-Sequence': sequenceKey,
      'X-Contentful-User-Agent': USER_AGENT,
    },
    baseURL: `https://api.contentful.com/spaces/${space}/environments/`,
    logHandler: (level, data) => logHandler(level, `CMA ${data}`),
  })

  const count = {
    cda: 0,
    cma: 0,
  }

  return {
    requestCounts: () => count,
    cma: {
      requestCounts: () => count.cma,
      entries: {
        getMany: async ({ environment, query }: GetEntriesParams) => {
          count.cma++
          const result = await cmaClient.get(`${environment}/entries`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as EntryCollection<any>
        },
        get: async ({ environment, entryId, query }: GetEntryParams) => {
          count.cma++
          const result = await cmaClient.get(`${environment}/entries/${entryId}`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as EntryProps<any>
        },
        unpublish: async ({ environment, entryId }: DeleteEntryParams) => {
          count.cma++
          const result = await cmaClient.delete(`${environment}/entries/${entryId}/published`)
          return result.data as EntryProps<any>
        },
        delete: async ({ environment, entryId }: DeleteEntryParams) => {
          count.cma++
          await cmaClient.delete(`${environment}/entries/${entryId}`)
        },
        create: async ({ environment, entry, entryId, contentType }: CreateEntryParams) => {
          count.cma++
          const result = await cmaClient.put(`${environment}/entries/${entryId}`, stripSys(entry), {
            headers: {
              'X-Contentful-Content-Type': contentType,
            },
          })
          return result.data as EntryProps<any>
        },
        update: async ({ environment, entry, entryId }: UpdateEntryParams) => {
          count.cma++
          const result = await cmaClient.put(`${environment}/entries/${entryId}`, entry, {
            headers: {
              'X-Contentful-Version': entry.sys.version,
            },
          })
          return result.data as EntryProps<any>
        },
        publish: async ({ environment, entry, entryId }: PublishEntryParams) => {
          count.cma++
          return cmaClient.put(`${environment}/entries/${entryId}/published`, entry, {
            headers: {
              'X-Contentful-Version': entry.sys.version,
            },
          })
        },
      },
    },
    cda: {
      requestCounts: () => count.cda,
      entries: {
        getMany: async ({ environment, query }: GetEntriesParams) => {
          count.cda++
          const result = await cdaClient.get(`${environment}/entries`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as EntryCollection<any>
        },
        get: async ({ environment, entryId, query }: GetEntryParams) => {
          count.cda++
          const result = await cdaClient.get(`${environment}/entries/${entryId}`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as Entry<any>
        },
      },
    },
  }
}

export function createCDAClient({
  space,
  cdaToken,
  logHandler,
  sequenceKey,
}: {
  space: string
  cdaToken: string
  logHandler: ClientLogHandler
  sequenceKey: string
}) {
  const cdaClient = createHttpClient(axios, {
    accessToken: cdaToken,
    space,
    throttle: 30,
    headers: {
      Authorization: `Bearer ${cdaToken}`,
      'Content-Type': 'application/vnd.contentful.delivery.v1+json',
      'CF-Sequence': sequenceKey,
      'X-Contentful-User-Agent': USER_AGENT,
    },
    baseURL: `https://cdn.contentful.com/spaces/${space}/environments/`,
    logHandler: (level, data) => logHandler(level, `CDA ${data}`),
  })

  const count = {
    cda: 0,
    cma: 0,
  }

  return {
    cda: {
      requestCounts: () => count.cda,
      entries: {
        getMany: async ({ environment, query }: GetEntriesParams) => {
          count.cda++
          const result = await cdaClient.get(`${environment}/entries`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as EntryCollection<any>
        },
        get: async ({ environment, entryId, query }: GetEntryParams) => {
          count.cda++
          const result = await cdaClient.get(`${environment}/entries/${entryId}`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as Entry<any>
        },
      },
    },
  }
}
