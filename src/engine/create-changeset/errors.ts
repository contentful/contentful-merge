import { AffectedEntities } from './types'

export interface LimitsExceededContext {
  limit: number
  affectedEntities: AffectedEntities
}

// export interface ContentModelDivergedContext {
// }


export class LimitsExceededError extends Error {
  public affectedEntities: AffectedEntities

  constructor(context: LimitsExceededContext) {
    const message = `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limit} entries.`
    super(message)
    this.affectedEntities = context.affectedEntities
  }
}

// TODO  We don't yet show information about the diverged content types, this needs to be added in next iteration
export class ContentModelDivergedError extends Error {

  public divergedContentTypeIds: string[]
  constructor(divergedContentTypeIds: string[]) {
    const message = 'The content models of the source and target environment are different. Before merging entries between environments, please make sure the content models are identical. We suggest using the Merge App to compare content models of different environments. Read more about the Merge App here: https://www.contentful.com/marketplace/app/merge.'
    super(message)
    this.divergedContentTypeIds = divergedContentTypeIds
  }
}
