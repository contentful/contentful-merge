import { createAffectedContentTypesDivergedTask } from './create-affected-content-types-diverged-task'
import { createComputeIdsTask } from './create-compute-ids-task'
import { createFetchPartialEntitiesTask } from './create-fetch-partial-entities-task'
import { createFetchAddedEntitiesTask } from './create-fetch-added-entities-task'
import { createFetchChangedEntitiesTask } from './create-fetch-changed-task'

/**
 * @description This module imports various task-creation functions related to creating changesets.
 * @property {Function} createFetchPartialEntitiesTask
 * @property {Function} createFetchChangedEntitiesTask
 * @property {Function} createFetchAddedEntitiesTask
 * @property {Function} createComputeIdsTask
 * @property {Function} createAffectedContentTypesDivergedTask
 */

export const CreateChangesetTasks = {
  createFetchPartialEntitiesTask,
  createFetchChangedEntitiesTask,
  createFetchAddedEntitiesTask,
  createComputeIdsTask,
  createAffectedContentTypesDivergedTask,
}
