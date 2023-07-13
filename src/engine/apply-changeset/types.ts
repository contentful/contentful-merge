import { ResponseStatusCollector } from '../client/response-status-collector'
import { BaseContext, Changeset, Client } from '../types'

export interface ApplyChangesetContext extends BaseContext<Client> {
  environmentId: string
  inputPath: string
  changeset: Changeset
  responseCollector: ResponseStatusCollector
}
