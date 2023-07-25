import { CreateChangesetContext } from '../create-changeset/types'

export class CreateChangesetError extends Error {
  public context: CreateChangesetContext
  constructor(message: string, context: CreateChangesetContext) {
    super(message)
    this.context = context
  }
}

export class LimitsExceededError extends CreateChangesetError {
  constructor(context: CreateChangesetContext) {
    const message = `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`
    super(message, context)
  }
}

// TODO Add ContentModelDivergedError
