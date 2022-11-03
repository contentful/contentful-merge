import {ChangeSet} from '../types'

export const createChangeset = (source: string, target: string): ChangeSet => ({
  sys: {
    type: 'ChangeSet',
    entityType: 'Entry',
    createdAt: Date.now().toString(),
    version: 1,
    source: {
      sys: {
        id: source,
        linkType: 'Environment',
        type: 'Link',
      },
    },
    target: {
      sys: {
        id: target,
        linkType: 'Environment',
        type: 'Link',
      },
    },
  },
  items: [],
})
