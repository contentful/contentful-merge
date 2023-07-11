import type { ListrTaskWrapper } from 'listr2'
import { ListrTask } from 'listr2'
import pLimit from 'p-limit'
import { LogLevel } from '../../logger/types'
import { Comparable, CreateChangesetContext, EntityData, EnvironmentScope } from '../types'
import { EntityType } from '../../types'

const LIMIT = 1000

type ExecuteParams = {
  context: CreateChangesetContext
  task: ListrTaskWrapper<CreateChangesetContext, any>
  scope: EnvironmentScope
  environmentId: string
  entityType: EntityType
}

const execute = async ({ context, environmentId, scope, task, entityType }: ExecuteParams) => {
  const {
    client: { cda },
  } = context

  const localContext: EntityData = {
    comparables: [],
    ids: [],
  }

  const api = cda[entityType]

  const { total } = await api.getMany({ environment: environmentId, query: { limit: 0 } })

  const promises = []
  let requestsDone = 0
  const result: Comparable[] = []
  const iterations = Math.ceil(total / LIMIT)

  const limiter = pLimit(7)

  for (let i = 0; i < iterations; i++) {
    promises.push(
      limiter(async () => {
        const response = await api.getMany({
          environment: environmentId,
          query: { select: ['sys.id', 'sys.updatedAt'], limit: LIMIT, skip: LIMIT * i },
        })
        requestsDone++
        task.output = `Fetching ${requestsDone * LIMIT}/${total} ${entityType}`
        result.push(...response.items)
      })
    )
  }

  await Promise.all(promises)

  localContext.comparables = result
  localContext.ids = result.map((item) => item.sys.id)

  return localContext
}

export function createEntitiesTask(scope: EnvironmentScope, environmentId: string, entityType: EntityType): ListrTask {
  return {
    title: `Reading the ${scope} environment "${environmentId}"`,
    task: async (context: CreateChangesetContext, task) => {
      context.logger.log(LogLevel.INFO, `Start createEntitiesTask for ${entityType}`)
      const result = await execute({ context, task, scope, environmentId, entityType })
      context[`${scope}Data`][entityType] = result
      return context
    },
  }
}
