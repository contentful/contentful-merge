import {Listr} from 'listr2'
import {createLoadChangesetTask} from './tasks/create-load-changeset-task'
import {createRemoveEntitiesTask} from './tasks/create-remove-entities-task'
import {ApplyChangesetContext} from './types'

export const applyChangesetTask = (context: ApplyChangesetContext): Listr => {
  return new Listr<ApplyChangesetContext>(
    [
      {
        title: 'Apply changeset',
        task: (ctx, task): Listr =>
          task.newListr([
            createLoadChangesetTask(),
            createRemoveEntitiesTask(),
          ], {concurrent: false}),
      },
    ],
    {
      ctx: context,
      rendererOptions: {showTimer: true, collapse: false},
    },
  )
}
