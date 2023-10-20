import { Changeset } from '../../../../src/engine/types'

export const createAddTwoItemsChangeset = (source: string, target: string, space: string): Changeset => ({
  sys: {
    type: 'Changeset',
    createdAt: '1697039529309',
    space: {
      sys: {
        id: space,
        type: 'Link',
        linkType: 'Space',
      },
    },
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
  items: [
    {
      changeType: 'add',
      entity: {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: 'new-entry-2',
        },
      },
      data: {
        sys: {
          id: 'new-entry-2',
          type: 'Entry',
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'testType',
            },
          },
        },
        fields: {
          title: {
            'en-US': 'default title',
          },
          description: {
            'en-US': "Lovely weather isn't it?",
          },
        },
      },
    },
    {
      changeType: 'add',
      entity: {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: 'new-entry',
        },
      },
      data: {
        sys: {
          id: 'new-entry',
          type: 'Entry',
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'testType',
            },
          },
        },
        fields: {
          title: {
            'en-US': 'default title',
          },
          description: {
            'en-US': "Lovely weather isn't it?",
          },
        },
      },
    },
  ],
})
