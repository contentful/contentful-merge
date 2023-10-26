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

export class AuthorizationErrorForApply extends ContentfulError {
  constructor(context: ApplyChangesetContext, extra?: any) {
    const message = `The CMA token you provided is invalid. Please make sure that your token is correct and not expired.`

    super(message, { context, extra })
  }
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

export class LocaleMissingForApplyError extends ContentfulError {
  constructor(context: ApplyChangesetContext) {
    const message = `The source environment does not contain the same locales as the target environment.`
    const details = {
      sourceEnvironment: context.changeset.sys.source.sys.id,
      targetEnvironment: context.environmentId,
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
  originalError: Record<any, any>
  extra?: string
}

export class MergeEntityError extends ContentfulError {
  public entryId: string
  public extra: string | undefined
  constructor(message: string, context: MergeEntityErrorContext) {
    super(message, context.originalError)
    this.extra = context.extra
    this.entryId = context.id

    if (context.originalError.sys?.id?.includes('AccessTokenInvalid')) {
      this.extra = `The CMA token you provided is invalid. Please make sure that your token is correct and not expired.`
    }
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
    if (context.originalError.sys?.id?.includes('VersionMismatch')) {
      context.extra = `The entry you are trying to add already exists in the selected environment.`
    }
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
