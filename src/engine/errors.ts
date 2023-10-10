import { ApplyChangesetContext } from './apply-changeset/types'
import { AffectedEntities } from './create-changeset/types'

export class ContentfulError extends Error {
  details: any
  constructor(message: string, details?: any) {
    super(message)
    this.details = details
  }
}

export interface LimitsExceededContext {
  limit: number
  affectedEntities: AffectedEntities
}

export class LimitsExceededForCreateError extends ContentfulError {
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

export class LimitsExceededForApplyError extends ContentfulError {
  constructor(context: ApplyChangesetContext) {
    const message = `The detected number of entries to be changed is too high.\nThe currently allowed limit is ${context.limit} entries.`
    const details = {
      limit: context.limit,
      amount: context.changeset.items.length,
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

export interface MergeEntityErrorContext {
  id: string
  details: Record<any, any>
}

export class MergeEntityError extends ContentfulError {
  public entryId: string
  constructor(message: string, context: MergeEntityErrorContext) {
    super(message, context.details)
    this.entryId = context.id
  }
}

export class ContainsMetadataError extends ContentfulError {
  constructor(entityId: string) {
    super(`Metadata in changesets is currently not supported`, { id: entityId })
  }
}

export class DeleteEntryError extends MergeEntityError {
  constructor(context: MergeEntityErrorContext) {
    super(`An error occurred while deleting an entry.`, context)
  }
}
export class AddEntryError extends MergeEntityError {
  constructor(context: MergeEntityErrorContext) {
    super(`An error occurred while adding an entry.`, context)
  }
}
export class PublishEntryError extends MergeEntityError {
  constructor(context: MergeEntityErrorContext) {
    super(`An error occurred while publishing an entry.`, context)
  }
}

export class UpdateEntryError extends MergeEntityError {
  constructor(context: MergeEntityErrorContext) {
    super(`An error occurred while updating an entry.`, context)
  }
}

export class ChangesetFileError extends ContentfulError {
  constructor(changesetFilePath: string) {
    super(
      `There is no changeset at the path you provided ("${changesetFilePath}").\nPlease provide the path to an existing changeset to the "--file" flag and try again.`
    )
  }
}
