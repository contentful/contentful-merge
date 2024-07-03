import axios from 'axios'
import { ContentTypeCollection, Entry, EntryCollection, Locale, LocaleCollection } from 'contentful'
import { EntryProps } from 'contentful-management'
import { createHttpClient, getUserAgentHeader } from 'contentful-sdk-core'
import { pickBy } from 'lodash'
import { ClientLogHandler } from '../logger/types'
import { stripSys } from '../utils/strip-sys'
import { resolve } from 'path'
import { homedir } from 'os'
import findUp from 'find-up'

import ContentfulSdkCorePKGJson from 'contentful-sdk-core/package.json'
import { readFileSync } from 'fs'

type CreateClientParams = {
  space: string
  cdaToken?: string
  cmaToken?: string
  logHandler: ClientLogHandler
  host?: string
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
type PublishEntryParams = ParamEnvironment & { entryId: string; entryVersion: number }

const cleanQuery = (query?: Record<string, any>) => pickBy(query, (v) => v !== undefined)

const SDK = `contentful-sdk-core/${ContentfulSdkCorePKGJson.version}`
const VERSION = '0.0.0'
const FEATURE = 'merge-library'
const APPLICATION = `contentful-merge/${VERSION}`
const INTEGRATION = 'cli'
const USER_AGENT = getUserAgentHeader(SDK, APPLICATION, INTEGRATION, FEATURE)

function getConfigPath() {
  const pathOverride = process.env.CONTENTFUL_CONFIG_FILE
  if (pathOverride) {
    return pathOverride
  }
  const contentfulrc = '.contentfulrc.json'
  const defaultPath = resolve(homedir(), contentfulrc)
  const nestedConfigPath = findUp.sync(contentfulrc)
  const configPath = nestedConfigPath || defaultPath
  return configPath
}

function loadRuntimeConfig() {
  const configPath = getConfigPath()
  let configFileContent

  try {
    const content = readFileSync(configPath)
    configFileContent = JSON.parse(content.toString())
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      throw e
    }

    configFileContent = {}
  }

  return configFileContent
}

const getHosts = (host: string) => {
  if (host.indexOf('api.eu.contentful.com') > -1) {
    return {
      cmaHost: 'api.eu.contentful.com',
      cdnHost: 'cdn.eu.contentful.com',
    }
  }

  return {
    cmaHost: 'api.contentful.com',
    cdnHost: 'cdn.contentful.com',
  }
}

export const createClient = ({
  space,
  cdaToken = 'CDA_TOKEN_NOT_SET',
  cmaToken = 'CMA_TOKEN_NOT_SET',
  logHandler,
  sequenceKey,
  host,
}: CreateClientParams & { sequenceKey: string }) => {
  const config = loadRuntimeConfig()

  const { cmaHost, cdnHost } = getHosts(host || config.host || 'api.contentful.com')

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
    baseURL: `https://${cdnHost}/spaces/${space}/environments/`,
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
    baseURL: `https://${cmaHost}/spaces/${space}/environments/`,
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
        publish: async ({ environment, entryVersion, entryId }: PublishEntryParams) => {
          count.cma++
          return cmaClient.put(`${environment}/entries/${entryId}/published`, undefined, {
            headers: {
              'X-Contentful-Version': entryVersion,
            },
          })
        },
      },
      locales: {
        getMany: async ({ environment }: ParamEnvironment) => {
          count.cma++
          const result = await cmaClient.get(`${environment}/locales`)
          return result.data as LocaleCollection
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
      contentTypes: {
        getMany: async ({ environment, query }: GetEntriesParams) => {
          count.cda++
          const result = await cdaClient.get(`${environment}/content_types`, {
            params: { ...cleanQuery(query) },
          })
          return result.data as ContentTypeCollection
        },
      },
    },
  }
}
