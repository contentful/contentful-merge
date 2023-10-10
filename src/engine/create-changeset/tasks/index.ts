import { affectedContentTypesDivergedTask } from './affected-content-types-diverged-task'
import { computeIdsTask } from './compute-ids-task'
import { fetchPartialEntitiesTask } from './fetch-partial-entities-task'
import { fetchAddedEntitiesTask } from './fetch-added-entities-task'
import { fetchChangedTasks } from './fetch-changed-tasks'

export const createChangesetTasks = {
  fetchPartialEntitiesTask,
  fetchChangedTasks,
  fetchAddedEntitiesTask,
  computeIdsTask,
  affectedContentTypesDivergedTask,
}
