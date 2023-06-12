import { Changeset, ChangesetChangeType } from '../types'

export const changesetItemsCount = (changeset: Changeset, changeType: ChangesetChangeType): number => {
  return changeset.items.filter((item) => item.changeType === changeType).length
}
