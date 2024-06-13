import { Listr, PRESET_TIMER } from 'listr2'
import { CreateChangesetContext } from './types'
import { CreateChangesetTasks } from './tasks'

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
                      CreateChangesetTasks.createFetchPartialEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      CreateChangesetTasks.createFetchPartialEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'contentTypes',
                      }),
                      CreateChangesetTasks.createComputeIdsTask({
                        entityType: 'contentTypes',
                      }),
                      CreateChangesetTasks.createFetchChangedEntitiesTask({
                        entityType: 'contentTypes',
                      }),
                    ],
                    {
                      ...subTaskOptions,
                      rendererOptions: { ...subTaskOptions.rendererOptions, collapseSubtasks: true },
                    },
                  )
                },
              },
              {
                title: 'Entries',
                task: (ctx, task): Listr => {
                  return task.newListr(
                    [
                      CreateChangesetTasks.createFetchPartialEntitiesTask({
                        scope: 'source',
                        environmentId: ctx.sourceEnvironmentId,
                        entityType: 'entries',
                        queryEntries: ctx.queryEntries,
                      }),
                      CreateChangesetTasks.createFetchPartialEntitiesTask({
                        scope: 'target',
                        environmentId: ctx.targetEnvironmentId,
                        entityType: 'entries',
                        queryEntries: ctx.queryEntries,
                      }),
                      CreateChangesetTasks.createComputeIdsTask({
                        entityType: 'entries',
                      }),
                      CreateChangesetTasks.createFetchChangedEntitiesTask({
                        entityType: 'entries',
                      }),
                      CreateChangesetTasks.createAffectedContentTypesDivergedTask(),
                      CreateChangesetTasks.createFetchAddedEntitiesTask({
                        entityType: 'entries',
                      }),
                    ],
                    subTaskOptions,
                  )
                },
              },
            ],
            {
              concurrent: false,
            },
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
    },
  )
}
