import { Changeset } from '../types'

export const createChangeset = (source: string, target: string): Changeset => ({
  sys: {
    type: 'Changeset',
    createdAt: Date.now().toString(),
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
