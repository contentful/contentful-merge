import { Listr, PRESET_TIMER } from 'listr2'
import { createCallbackTask } from '../callback-task'
import { ClientPerformanceObserver } from '../client/client-performance-observer'
import { createComputeIdsTask } from './tasks/create-compute-ids-task'
import { createEntitiesTask } from './tasks/create-entities-task'
import { createFetchAddedEntitiesTask } from './tasks/create-fetch-added-entities-task'
import { createFetchChangedTasks } from './tasks/create-fetch-changed-tasks'
import { CreateChangesetContext } from './types'
import { createAffectedContentTypesDivergedTask } from './tasks/create-affected-content-types-diverged-task'

const subTaskOptions = {
  concurrent: false,
  rendererOptions: {
    timer: PRESET_TIMER,
    collapseSubtasks: true,
  },
}
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
                      createEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      createEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      createComputeIdsTask({
                        entityType: 'contentTypes',
                      }),
                    ],
                    subTaskOptions
                  )
                },
              },
              {
                title: 'Entries',
                skip: (ctx: CreateChangesetContext) => ctx.contentModelDiverged,
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      createEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'entries',
                      }),
                      createEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'entries',
                      }),
                      createComputeIdsTask({
                        entityType: 'entries',
                      }),
                      createAffectedContentTypesDivergedTask(),
                      createFetchChangedTasks({
                        entityType: 'entries',
                        skipHandler: () => {
                          return context.contentModelDiverged || context.exceedsLimits
                        },
                      }),
                      createFetchAddedEntitiesTask({
                        entityType: 'entries',
                        skipHandler: () => {
                          return context.contentModelDiverged || context.exceedsLimits
                        },
                      }),
                    ],
                    subTaskOptions
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
        collapseErrors: false,
      },
      collectErrors: 'minimal',
    }
  )
}
