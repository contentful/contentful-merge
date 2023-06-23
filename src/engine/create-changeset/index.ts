import { Listr, PRESET_TIMER } from 'listr2'
import { createCallbackTask } from '../callback-task'
import { ClientPerformanceObserver } from '../client/client-performance-observer'
import { createComputeIdsTask } from './tasks/create-compute-ids-task'
import { createEntitiesTask } from './tasks/create-entities-task'
import { createFetchAddedEntitiesTask } from './tasks/create-fetch-added-entities-task'
import { createFetchChangedTasks } from './tasks/create-fetch-changed-tasks'
import { CreateChangesetContext } from './types'

export const createChangesetTask = (context: CreateChangesetContext): Listr => {
  return new Listr<CreateChangesetContext>(
    [
      {
        title: 'Create Changeset',
        task: (ctx, task): Listr => {
          const performanceObserver = new ClientPerformanceObserver(ctx.client)
          performanceObserver.start((payload) => {
            task.title = `Creating a Changeset`
          })
          return task.newListr(
            [
              createEntitiesTask('source', ctx.sourceEnvironmentId),
              createEntitiesTask('target', ctx.targetEnvironmentId),
              createComputeIdsTask(),
              createFetchChangedTasks(),
              createFetchAddedEntitiesTask(context.inline),
              createCallbackTask(() => performanceObserver.stop()),
            ],
            { concurrent: false }
          )
        },
      },
    ],
    {
      ctx: context,
      rendererOptions: {
        timer: PRESET_TIMER,
        collapseSubtasks: false,
      },
    }
  )
}
