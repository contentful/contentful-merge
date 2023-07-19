import { CreateChangesetContext } from '../create-changeset/types'

export class LimitsExceededError extends Error {
  constructor(context: CreateChangesetContext) {
    const message = `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`
    super(message)
  }
}

export class AccessDeniedError extends Error {
  constructor() {
    const message =
      'Access denied. Please make sure the api key you are providing has access to all compared environments.'
    super(message)
  }
}

// TODO Add ContentModelDivergedError
