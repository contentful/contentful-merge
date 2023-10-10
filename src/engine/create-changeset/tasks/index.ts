import { createAffectedContentTypesDivergedTask } from './create-affected-content-types-diverged-task'
import { createComputeIdsTask } from './create-compute-ids-task'
import { createFetchPartialEntitiesTask } from './create-fetch-partial-entities-task'
import { createFetchAddedEntitiesTask } from './create-fetch-added-entities-task'
import { createFetchChangedTasks } from './create-fetch-changed-tasks'

export const CreateChangesetTasks = {
  createFetchPartialEntitiesTask,
  createFetchChangedTasks,
  createFetchAddedEntitiesTask,
  createComputeIdsTask,
  createAffectedContentTypesDivergedTask,
}
