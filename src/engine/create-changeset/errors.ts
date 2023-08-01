import { AffectedEntities } from './types'

export class ContentfulError extends Error {
  details: any
  constructor(message: string, details: any) {
    super(message)
    this.details = details
  }
}

export interface LimitsExceededContext {
  limit: number
  affectedEntities: AffectedEntities
}

export class LimitsExceededError extends ContentfulError {
  constructor(context: LimitsExceededContext) {
    const entries = context.affectedEntities.entries
    const message = `The detected number of entries to be compared, added or deleted is too high.\nThe currently allowed limit is ${context.limit} entries.`
    const details = {
      limit: context.limit,
      amount: {
        added: entries.added.length,
        removed: entries.removed.length,
        maybeChanged: entries.maybeChanged.length,
        total: entries.added.length + entries.removed.length + entries.maybeChanged.length,
      },
    }
    super(message, details)
  }
}

export class ContentModelDivergedError extends ContentfulError {
  public divergedContentTypeIds: string[]
  constructor(divergedContentTypeIds: string[]) {
    const message =
      'The content models of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.'
    const details = { amount: divergedContentTypeIds.length }
    super(message, details)
    this.divergedContentTypeIds = divergedContentTypeIds
  }
}
