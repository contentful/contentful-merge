import {Listr} from 'listr2'
import {createComputeIdsTask} from './tasks/createComputeIdsTask'
import {createEntitiesTask} from './tasks/createEntitiesTask'
import {createFetchChangedTasks} from './tasks/createFetchChangedTasks'
import {CreateChangesetContext} from './types'

export const createChangeset = (context: CreateChangesetContext) => {
  const tasks = new Listr<CreateChangesetContext>(
    [
      {
        title: 'Fetch environment entities',
        task: (ctx, task): Listr =>
          task.newListr([
            createEntitiesTask('source', ctx.sourceEnvironmentId),
            createEntitiesTask('target', ctx.targetEnvironmentId),
          ], {concurrent: false}),
      },
      createComputeIdsTask(),
      createFetchChangedTasks(),
    ],
    {
      ctx: context,
    },
  )

  return tasks
}
