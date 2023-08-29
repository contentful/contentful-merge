import { Listr, PRESET_TIMER } from 'listr2'
import { createAddEntitiesTask } from './tasks/create-add-entities-task'
import { createChangeEntitiesTask } from './tasks/create-change-entities-task'
import { createLoadChangesetTask } from './tasks/create-load-changeset-task'
import { createRemoveEntitiesTask } from './tasks/create-remove-entities-task'
import { ApplyChangesetContext } from './types'

export const applyChangesetTask = (context: ApplyChangesetContext): Listr => {
  return new Listr<ApplyChangesetContext>(
    [
      {
        title: 'Applying the Changeset',
        task: (ctx, task): Listr => {
          return task.newListr(
            [
              createLoadChangesetTask(),
              createRemoveEntitiesTask(),
              createAddEntitiesTask(),
              createChangeEntitiesTask(),
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
        showErrorMessage: false,
      },
    }
  )
}
