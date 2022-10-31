import {ListrTask} from 'listr2'
import {CreateChangesetContext} from '../types'

export function createFetchAddedEntitiesTask(): ListrTask {
  return {
    title: 'Fetch full payload for added entities',
    task: async (context: CreateChangesetContext, task) => {
      const {client, ids: {added}} = context
      task.title = `Fetch full payload for ${added.length} added entities`
      // create batches for requests and assign to changeset
      // use task
    },
  }
}
