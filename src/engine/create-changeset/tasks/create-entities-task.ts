import {Entry} from 'contentful'
import type {ListrTaskWrapper} from 'listr2'
import {ListrTask} from 'listr2'
import {LogLevel} from '../../logger/types'
import {CreateChangesetContext, EnvironmentScope} from '../types'

const LIMIT = 1000

type ExecuteParams = {
  context: CreateChangesetContext,
  task: ListrTaskWrapper<CreateChangesetContext, any>,
  scope: EnvironmentScope,
  environmentId: string
}

const execute = async ({context, environmentId, scope, task}: ExecuteParams) => {
  const {client: {cda}} = context

  const {total} = await cda.entries.getMany({environment: environmentId, query: {limit: 0}})

  const promises = []
  let requestsDone = 0
  const result: Entry<any>[] = []
  const iterations = Math.ceil(total / LIMIT)

  for (let i = 0; i < iterations; i++) {
    promises.push(Promise.resolve().then(async () => {
      const response = await cda.entries.getMany({
        environment: environmentId,
        query: {select: ['sys.id', 'sys.updatedAt'], limit: LIMIT, skip: LIMIT * i},
      })
      requestsDone++
      task.output = `fetching ${requestsDone * LIMIT}/${total} entities`
      result.push(...response.items)
    }))
  }

  await Promise.all(promises)

  context[scope].comparables = result
  context[scope].ids = result.map(item => item.sys.id)

  return context
}

export function createEntitiesTask(scope: EnvironmentScope, environmentId: string): ListrTask {
  return {
    title: `${scope} environment "${environmentId}" with (${LIMIT} entities/request)`,
    task: async (context: CreateChangesetContext, task) => {
      context.logger.log(LogLevel.INFO, 'Start createEntitiesTask')
      return execute({context, task, scope, environmentId})
    },
  }
}
