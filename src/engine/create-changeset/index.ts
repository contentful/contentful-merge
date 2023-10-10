import { Listr, PRESET_TIMER } from 'listr2'
import { CreateChangesetContext } from './types'
import { createChangesetTasks } from './tasks'

const subTaskOptions = {
  concurrent: false,
  rendererOptions: {
    timer: PRESET_TIMER,
    collapseSubtasks: false,
  },
}

export const createChangesetTask = (context: CreateChangesetContext): Listr => {
  return new Listr<CreateChangesetContext>(
    [
      {
        title: 'Creating a Changeset',
        task: (ctx, task): Listr => {
          return task.newListr(
            [
              {
                title: 'Check content model',
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      createChangesetTasks.fetchPartialEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      createChangesetTasks.fetchPartialEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      createChangesetTasks.computeIdsTask({
                        entityType: 'contentTypes',
                      }),
                      createChangesetTasks.fetchChangedTasks({
                        entityType: 'contentTypes',
                      }),
                    ],
                    {
                      ...subTaskOptions,
                      rendererOptions: { ...subTaskOptions.rendererOptions, collapseSubtasks: true },
                    }
                  )
                },
              },
              {
                title: 'Entries',
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      createChangesetTasks.fetchPartialEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'entries',
                      }),
                      createChangesetTasks.fetchPartialEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'entries',
                      }),
                      createChangesetTasks.computeIdsTask({
                        entityType: 'entries',
                      }),
                      createChangesetTasks.fetchChangedTasks({
                        entityType: 'entries',
                      }),
                      createChangesetTasks.affectedContentTypesDivergedTask(),
                      createChangesetTasks.fetchAddedEntitiesTask({
                        entityType: 'entries',
                      }),
                    ],
                    subTaskOptions
                  )
                },
              },
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
        showErrorMessage: false,
      },
    }
  )
}
