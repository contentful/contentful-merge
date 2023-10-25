import { createAddEntitiesTask } from './create-add-entities-task'
import { createChangeEntitiesTask } from './create-change-entities-task'
import { createLoadChangesetTask } from './create-load-changeset-task'
import { createRemoveEntitiesTask } from './create-remove-entities-task'
import { createValidateChangesetTask } from './create-validate-changeset-task'
import { createValidateAccessTask } from './create-validate-access-task'

/**
 * @description This module imports various task-creation functions related to applying changesets.
 * @property {function} createValidateChangesetTask
 * @property {function} createRemoveEntitiesTask
 * @property {function} createLoadChangesetTask
 * @property {function} createChangeEntitiesTask
 * @property {function} createAddEntitiesTask
 * @property {function} createValidateAccessTask
 */

export const ApplyChangesetTasks = {
  createValidateChangesetTask,
  createRemoveEntitiesTask,
  createLoadChangesetTask,
  createChangeEntitiesTask,
  createAddEntitiesTask,
  createValidateAccessTask,
}
