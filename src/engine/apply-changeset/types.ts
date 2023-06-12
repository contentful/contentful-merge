import { ResponseStatusCollector } from '../client/response-status-collector'
import { BaseContext, Changeset } from '../types'

export interface ApplyChangesetContext extends BaseContext {
  environmentId: string
  inputPath: string
  changeset: Changeset
  responseCollector: ResponseStatusCollector
}
