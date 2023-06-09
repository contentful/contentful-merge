import { ChangeSet, ChangeSetChangeType } from '../types'

export const changeSetItemsCount = (changeSet: ChangeSet, changeType: ChangeSetChangeType): number => {
  return changeSet.items.filter((item) => item.changeType === changeType).length
}
