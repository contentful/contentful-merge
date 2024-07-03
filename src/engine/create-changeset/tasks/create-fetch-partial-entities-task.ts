import type { ListrTaskWrapper } from 'listr2'
import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { Comparable, CreateChangesetContext, EntityData, EnvironmentScope } from '../types'
import { EntityType } from '../../types'

type ExecuteParams = {
  context: CreateChangesetContext
  task: ListrTaskWrapper<CreateChangesetContext, any, any>
  scope: EnvironmentScope
  environmentId: string
  entityType: EntityType
  additionalFields: string[]
  queryEntries?: string[]
}

function clearQueryEntries(queryEntries?: string[]) {
  if (!queryEntries) return {}
  return queryEntries.reduce((acc, entry) => {
    const splitInput = entry.split('=')

    if (splitInput.length !== 2) {
      return acc
    }

    const key = splitInput[0].trim()
    const value = splitInput[1].trim()
    return { ...acc, [key]: value }
  }, {})
}

const execute = async ({
  context,
  environmentId,
  task,
  entityType,
  additionalFields = [],
  queryEntries,
}: ExecuteParams) => {
  const {
    client: { cda },
    requestBatchSize,
  } = context

  const localContext: EntityData = {
    comparables: [],
    ids: [],
  }

  const api = cda[entityType]

  const { total } = await api.getMany({
    environment: environmentId,
    query: { limit: 0, ...clearQueryEntries(queryEntries) },
  })

  const promises = []
  let requestsDone = 0
  const result: Comparable[] = []
  const iterations = Math.ceil(total / requestBatchSize)

  const limiter = pLimit(7)

  for (let i = 0; i < iterations; i++) {
    promises.push(
      limiter(async () => {
        const response = await api.getMany({
          environment: environmentId,
          query: {
            select: ['sys.id', 'sys.updatedAt', ...additionalFields],
            limit: requestBatchSize,
            skip: requestBatchSize * i,
            ...clearQueryEntries(queryEntries),
          },
        })
        requestsDone++
        task.output = `Fetching ${requestsDone * requestBatchSize}/${total} ${entityType}`
        result.push(...response.items)
      }),
    )
  }
  await Promise.all(promises)

  localContext.comparables = result
  localContext.ids = result.map((item) => item.sys.id)

  return localContext
}

type EntitiesTaskProps = {
  scope: EnvironmentScope
  environmentId: string
  entityType: EntityType
  queryEntries?: string[]
}

// This function fetches only id and updatedAt properties of all
// entities. With this information, we are able to determine which
// entities differ between environments, so that in next steps we can
// fetch only those completely.
export function createFetchPartialEntitiesTask({
  scope,
  environmentId,
  entityType,
  queryEntries,
}: EntitiesTaskProps): ListrTask {
  return {
    title: `Reading the ${scope} environment "${environmentId}"`,
    task: async (context: CreateChangesetContext, task) => {
      context.logger.info(`Start fetchPartialEntitiesTask for ${entityType}`)
      const additionalFields = entityType === 'entries' ? ['sys.contentType.sys.id'] : []
      context[`${scope}Data`][entityType] = await execute({
        context,
        task,
        scope,
        environmentId,
        entityType,
        additionalFields,
        queryEntries,
      })
      return context
    },
  }
}
