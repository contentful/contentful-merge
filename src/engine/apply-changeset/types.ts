import {BaseContext, ChangeSet} from '../types'

export interface ApplyChangesetContext extends BaseContext {
  environmentId: string,
  inputPath: string,
  changeSet: ChangeSet
}
