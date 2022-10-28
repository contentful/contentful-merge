import {createClient} from 'contentful'
import getContentfulCollection from 'contentful-collection'
import type {ListrTaskWrapper} from 'listr2'
import {ListrTask} from 'listr2'
import {CreateChangesetContext, EnvironmentScope} from '../types'

const LIMIT = 10

const execute = async (context: CreateChangesetContext, task: ListrTaskWrapper<CreateChangesetContext, any>, scope: EnvironmentScope, environmentId: string) => {
  const CDAClient = createClient({
    accessToken: context.accessToken,
    space: context.spaceId,
    environment: environmentId,
  })

  let requestsDone = 0

  const {total} = await CDAClient.getEntries({limit: 0})
  const result = await getContentfulCollection(q => {
    requestsDone++
    context.requestCount++
    task.output = `fetching ${requestsDone * LIMIT}/${total} entities`
    return CDAClient.getEntries(q)
  }, {select: ['sys.id', 'sys.updatedAt'], limit: LIMIT})

  context[scope].comparables = result
  context[scope].ids = result.map(item => item.sys.id)

  return context
}

export function createEntitiesTask(scope: EnvironmentScope, environmentId: string): ListrTask {
  return {
    title: `${scope} environment (${environmentId}) with limit ${LIMIT}`,
    task: async (context: CreateChangesetContext, task) => {
      return execute(context, task, scope, environmentId)
    },
  }
}
