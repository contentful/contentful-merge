import { createAddEntitiesTask } from './create-add-entities-task'
import { createChangeEntitiesTask } from './create-change-entities-task'
import { createLoadChangesetTask } from './create-load-changeset-task'
import { createRemoveEntitiesTask } from './create-remove-entities-task'
import { createValidateChangesetTask } from './create-validate-changeset-task'

export const ApplyChangesetTasks = {
  createValidateChangesetTask,
  createRemoveEntitiesTask,
  createLoadChangesetTask,
  createChangeEntitiesTask,
  createAddEntitiesTask,
}
