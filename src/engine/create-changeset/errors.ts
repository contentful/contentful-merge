import { CreateChangesetContext } from '../create-changeset/types'
// import { icons, pluralizeEntry, entityStatRenderer } from '../utils'

// const entryChangeRenderer = entityStatRenderer({
//   icon: icons.bulletPoint,
//   pluralizer: pluralizeEntry,
// })

export class LimitsExceededError extends Error {
  constructor(context: CreateChangesetContext) {
    const message = `The detected number of entries to be compared, added or removed is too high.\nThe currently allowed limit is ${context.limits.all} entries.`

    // const entriesAddedLength = context.affectedEntities.entries.added.length
    // const entriesRemovedLength = context.affectedEntities.entries.removed.length
    // const entriesMaybeChangedLength = context.affectedEntities.entries.maybeChanged.length

    // message += `\nDetected number of changes:`
    // message += '\n'
    // message += `\n  ${entryChangeRenderer(entriesAddedLength, 'added')}`
    // message += `\n  ${entryChangeRenderer(entriesRemovedLength, 'removed')}`
    // message += `\n  ${entryChangeRenderer(entriesMaybeChangedLength)} to be compared`

    super(message)
  }
}

export class AccessDeniedError extends Error {
  constructor() {
    const message =
      'An authorisation issue occurred. Please make sure the API key you provided has access to both environments.'
    super(message)
  }
}

// TODO Add ContentModelDivergedError
