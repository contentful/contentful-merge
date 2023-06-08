import { ResponseStatusCollector } from '../client/response-status-collector'
import { BaseContext, ChangeSet } from '../types'

export interface ApplyChangesetContext extends BaseContext {
  environmentId: string
  inputPath: string
  changeSet: ChangeSet
  responseCollector: ResponseStatusCollector
}
