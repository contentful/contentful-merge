import {Listr} from 'listr2'
import {createComputeIdsTask} from './tasks/create-compute-ids-task'
import {createEntitiesTask} from './tasks/create-entities-task'
import {createFetchAddedEntitiesTask} from './tasks/create-fetch-added-entities-task'
import {createFetchChangedTasks} from './tasks/create-fetch-changed-tasks'
import {CreateChangesetContext} from './types'

export const createChangeset = (context: CreateChangesetContext) => {
  return new Listr<CreateChangesetContext>(
    [
      {
        title: 'Fetch environment entities',
        task: (ctx, task): Listr =>
          task.newListr([
            createEntitiesTask('source', ctx.sourceEnvironmentId),
            createEntitiesTask('target', ctx.targetEnvironmentId),
          ], {concurrent: true}),
      },
      createComputeIdsTask(),
      createFetchChangedTasks(),
      createFetchAddedEntitiesTask(context.inline),
    ],
    {
      ctx: context,
      rendererOptions: {showTimer: true, collapse: false},
    },
  )
}
