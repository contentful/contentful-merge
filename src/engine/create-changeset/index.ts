import { Listr, PRESET_TIMER } from 'listr2'
import { createCallbackTask } from '../callback-task'
import { ClientPerformanceObserver } from '../client/client-performance-observer'
import { createComputeIdsTask } from './tasks/create-compute-ids-task'
import { createEntitiesTask } from './tasks/create-entities-task'
import { createFetchAddedEntitiesTask } from './tasks/create-fetch-added-entities-task'
import { createFetchChangedTasks } from './tasks/create-fetch-changed-tasks'
import { CreateChangesetContext } from './types'
import { createContentTypesDivergedTask } from './tasks/create-content-types-diverged-task'

export const createChangesetTask = (context: CreateChangesetContext): Listr => {
  return new Listr<CreateChangesetContext>(
    [
      {
        title: 'Creating a Changeset',
        task: (ctx, task): Listr => {
          const performanceObserver = new ClientPerformanceObserver(ctx.client)
          performanceObserver.start(() => {
            task.title = `Creating a Changeset`
          })
          return task.newListr(
            [
              {
                title: 'Content Types',
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      createEntitiesTask('source', ctx.sourceEnvironmentId, 'contentTypes'),
                      createEntitiesTask('target', ctx.targetEnvironmentId, 'contentTypes'),
                      createComputeIdsTask('contentTypes'),
                      createContentTypesDivergedTask(),
                    ],
                    {
                      concurrent: false,
                      rendererOptions: {
                        timer: PRESET_TIMER,
                        collapseSubtasks: true,
                      },
                    }
                  )
                },
              },
              {
                title: 'Entries',
                skip: (ctx: CreateChangesetContext) => ctx.contentModelDiverged,
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      createEntitiesTask('source', ctx.sourceEnvironmentId, 'entries'),
                      createEntitiesTask('target', ctx.targetEnvironmentId, 'entries'),
                      createComputeIdsTask('entries'),
                      createFetchChangedTasks('entries'),
                      createFetchAddedEntitiesTask(context.inline, 'entries'),
                    ],
                    {
                      concurrent: false,
                      rendererOptions: {
                        timer: PRESET_TIMER,
                        collapseSubtasks: true,
                      },
                    }
                  )
                },
              },

              createCallbackTask(() => performanceObserver.stop()),
            ],
            {
              concurrent: false,
            }
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
