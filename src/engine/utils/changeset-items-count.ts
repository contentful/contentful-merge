import { Changeset, ChangesetChangeType } from '../types'

export const changesetItemsCount = (changeset: Changeset, changeType: ChangeetChangeType): number => {
  return changeset.items.filter((item) => item.changeType === changeType).length
}
