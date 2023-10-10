import { Listr, PRESET_TIMER } from 'listr2'
import { applyAddEntitiesTask } from './tasks/apply-add-entities-task'
import { applyChangeEntitiesTask } from './tasks/apply-change-entities-task'
import { applyLoadChangesetTask } from './tasks/apply-load-changeset-task'
import { applyRemoveEntitiesTask } from './tasks/apply-remove-entities-task'
import { ApplyChangesetContext } from './types'
import { applyValidateChangesetTask } from './tasks/apply-validate-changeset-task'

export const applyChangesetTask = (context: ApplyChangesetContext): Listr => {
  return new Listr<ApplyChangesetContext>(
    [
      {
        title: 'Applying the Changeset',
        task: (ctx, task): Listr => {
          return task.newListr(
            [
              applyLoadChangesetTask(),
              applyValidateChangesetTask(),
              applyRemoveEntitiesTask(),
              applyAddEntitiesTask(),
              applyChangeEntitiesTask(),
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
