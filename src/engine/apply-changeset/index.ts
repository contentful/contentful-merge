import { Listr, PRESET_TIMER } from 'listr2'
import { ApplyChangesetContext } from './types'
import { ApplyChangesetTasks } from './tasks'

export const applyChangesetTask = (context: ApplyChangesetContext): Listr => {
  return new Listr<ApplyChangesetContext>(
    [
      {
        title: 'Applying the Changeset',
        task: (ctx, task): Listr => {
          return task.newListr(
            [
              ApplyChangesetTasks.createLoadChangesetTask(),
              ApplyChangesetTasks.createValidateChangesetTask(),
              ApplyChangesetTasks.createRemoveEntitiesTask(),
              ApplyChangesetTasks.createAddEntitiesTask(),
              ApplyChangesetTasks.createChangeEntitiesTask(),
            ],
            { concurrent: false },
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
