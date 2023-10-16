import { ResponseStatusCollector } from '../client/response-status-collector'
import { BaseContext, Changeset } from '../types'

type ProcessedEntityData = {
  added: Array<string>
  deleted: Array<string>
  updated: Array<string>
}

type ProcessedEntities = Record<'entries', ProcessedEntityData>

export interface ApplyChangesetContext extends BaseContext {
  environmentId: string
  inputPath: string
  changeset: Changeset
  processedEntities: ProcessedEntities
  responseCollector: ResponseStatusCollector
  limit: number
}

export type Warning = 'IMMEDIATE_PUBLISH' | 'MASTER_IS_TARGET' | 'OLD_CREATION_DATE' | 'ENVIRONMENTS_DONT_MATCH'
