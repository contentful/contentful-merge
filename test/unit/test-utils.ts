import { Listr, ListrTask, SilentRenderer } from 'listr2'
import { ApplyChangesetContext } from '../../src/engine/apply-changeset/types'
import { CreateChangesetContext } from '../../src/engine/create-changeset/types'
import { ChangesetChangeType } from '../../src/engine/types'

// We use a silent renderer to keep the test output clean
export const initializeTask = (task: ListrTask, context: CreateChangesetContext | ApplyChangesetContext) =>
  new Listr([task], { ctx: context, renderer: SilentRenderer })

export const matchChangeType =
  (type: ChangesetChangeType) =>
  ({ changeType }: { changeType: ChangesetChangeType }) =>
    changeType === type
