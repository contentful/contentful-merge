import { Listr, PRESET_TIMER } from 'listr2'
import { createCallbackTask } from '../callback-task'
import { ClientPerformanceObserver } from '../client/client-performance-observer'
import { createAddEntitiesTask } from './tasks/create-add-entities-task'
import { createChangeEntitiesTask } from './tasks/create-change-entities-task'
import { createLoadChangesetTask } from './tasks/create-load-changeset-task'
import { createRemoveEntitiesTask } from './tasks/create-remove-entities-task'
import { ApplyChangesetContext } from './types'

export const applyChangesetTask = (context: ApplyChangesetContext): Listr => {
  return new Listr<ApplyChangesetContext>(
    [
      {
        title: 'Apply changeset',
        task: (ctx, task): Listr => {
          const performanceObserver = new ClientPerformanceObserver(ctx.client)
          performanceObserver.start((payload) => {
            task.title = `Apply changeset (CMA: ${payload.cma}, CDA: ${payload.cda})`
          })
          return task.newListr(
            [
              createLoadChangesetTask(),
              createRemoveEntitiesTask(),
              createAddEntitiesTask(),
              createChangeEntitiesTask(),
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
        showErrorMessage: true,
      },
    }
  )
}
