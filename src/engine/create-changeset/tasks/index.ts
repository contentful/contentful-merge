import { affectedContentTypesDivergedTask } from './create-affected-content-types-diverged-task'
import { computeIdsTask } from './create-compute-ids-task'
import { fetchPartialEntitiesTask } from './create-entities-task'
import { fetchAddedEntitiesTask } from './create-fetch-added-entities-task'
import { fetchChangedTasks } from './create-fetch-changed-tasks'

export const createChangesetTasks = {
  fetchPartialEntitiesTask,
  fetchChangedTasks,
  fetchAddedEntitiesTask,
  computeIdsTask,
  affectedContentTypesDivergedTask,
}
