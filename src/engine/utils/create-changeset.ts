import { Changeset } from '../types'

export const createChangeset = (source: string, target: string): Changeset => ({
  sys: {
    type: 'Changeset',
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
