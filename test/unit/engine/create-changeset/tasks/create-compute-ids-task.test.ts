import { expect } from 'chai'
import { createStubInstance } from 'sinon'
import { initializeTask } from '../../../test-utils'
import { MemoryLogger } from '../../../../../src/engine/logger/memory-logger'
import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { createComputeIdsTask } from '../../../../../src/engine/create-changeset/tasks/create-compute-ids-task'

describe('createComputeIdsTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = {
      logger: createStubInstance(MemoryLogger),
      source: {
        comparables: [
          {
            sys: {
              id: '2uNOpLMJioKeoMq8W44uYc',
              updatedAt: '2023-05-17T13:36:43.271Z',
            },
          },
          {
            sys: {
              id: '3jkW4CdxPqu8Q2oSgCeOuy',
              updatedAt: '2023-05-17T10:38:42.612Z',
            },
          },
          {
            sys: {
              id: '5mgMoU9aCWE88SIqSIMGYE',
              updatedAt: '2023-05-17T10:40:42.033Z',
            },
          },
          {
            sys: {
              id: '5p9qNpTOJaCE6ykC4a8Wqg',
              updatedAt: '2023-05-17T10:36:55.860Z',
            },
          },
          {
            sys: {
              id: '3op5VIqGZiwoe06c8IQIMO',
              updatedAt: '2023-05-17T10:36:40.280Z',
            },
          },
          {
            sys: {
              id: 'Dy6jo5j4goU2C4sc8Kwkk',
              updatedAt: '2023-05-17T10:36:39.704Z',
            },
          },
          {
            sys: {
              id: '6gFiJvssqQ62CMYqECOu2M',
              updatedAt: '2023-05-17T10:36:37.596Z',
            },
          },
        ],
        ids: [
          '2uNOpLMJioKeoMq8W44uYc',
          '3jkW4CdxPqu8Q2oSgCeOuy',
          '5mgMoU9aCWE88SIqSIMGYE',
          '5p9qNpTOJaCE6ykC4a8Wqg',
          '3op5VIqGZiwoe06c8IQIMO',
          'Dy6jo5j4goU2C4sc8Kwkk',
          '6gFiJvssqQ62CMYqECOu2M',
        ],
      },
      target: {
        comparables: [
          {
            sys: {
              id: '2uNOpLMJioKeoMq8W44uYc',
              updatedAt: '2023-05-17T10:36:43.271Z',
            },
          },
          {
            sys: {
              id: '3jkW4CdxPqu8Q2oSgCeOuy',
              updatedAt: '2023-05-17T10:36:42.612Z',
            },
          },
          {
            sys: {
              id: '5mgMoU9aCWE88SIqSIMGYE',
              updatedAt: '2023-05-17T10:36:42.033Z',
            },
          },
          {
            sys: {
              id: '34MlmiuMgU8wKCOOIkAuMy',
              updatedAt: '2023-05-17T10:36:41.429Z',
            },
          },
          {
            sys: {
              id: '5p9qNpTOJaCE6ykC4a8Wqg',
              updatedAt: '2023-05-17T10:36:40.860Z',
            },
          },
          {
            sys: {
              id: 'Dy6jo5j4goU2C4sc8Kwkk',
              updatedAt: '2023-05-17T10:36:39.704Z',
            },
          },
          {
            sys: {
              id: '1toEOumnkEksWakieoeC6M',
              updatedAt: '2023-05-17T10:36:39.013Z',
            },
          },
        ],
        ids: [
          '2uNOpLMJioKeoMq8W44uYc',
          '3jkW4CdxPqu8Q2oSgCeOuy',
          '5mgMoU9aCWE88SIqSIMGYE',
          '34MlmiuMgU8wKCOOIkAuMy',
          '5p9qNpTOJaCE6ykC4a8Wqg',
          'Dy6jo5j4goU2C4sc8Kwkk',
          '1toEOumnkEksWakieoeC6M',
        ],
      },
      ids: {
        added: [],
        removed: [],
      },
      maybeChanged: [],
    } as unknown as CreateChangesetContext
  })
  it('adds added ids to the context', async () => {
    const task = initializeTask(createComputeIdsTask(), context)
    await task.run()

    expect(context.ids.added).to.deep.equal(['3op5VIqGZiwoe06c8IQIMO', '6gFiJvssqQ62CMYqECOu2M'])
  })
  it('adds removed ids to the context', async () => {
    const task = initializeTask(createComputeIdsTask(), context)
    await task.run()

    expect(context.ids.removed).to.deep.equal(['34MlmiuMgU8wKCOOIkAuMy', '1toEOumnkEksWakieoeC6M'])
  })
  it('adds changed ids to the context', async () => {
    const task = initializeTask(createComputeIdsTask(), context)
    await task.run()

    expect(context.maybeChanged).to.deep.equal([
      {
        sys: {
          id: '2uNOpLMJioKeoMq8W44uYc',
          updatedAt: '2023-05-17T10:36:43.271Z',
        },
      },
      {
        sys: {
          id: '3jkW4CdxPqu8Q2oSgCeOuy',
          updatedAt: '2023-05-17T10:36:42.612Z',
        },
      },
      {
        sys: {
          id: '5mgMoU9aCWE88SIqSIMGYE',
          updatedAt: '2023-05-17T10:36:42.033Z',
        },
      },
      {
        sys: {
          id: '5p9qNpTOJaCE6ykC4a8Wqg',
          updatedAt: '2023-05-17T10:36:40.860Z',
        },
      },
    ])
  })
  it('does not add id to context if nothing has changed', async () => {
    const task = initializeTask(createComputeIdsTask(), context)
    await task.run()

    expect(context.ids.added).not.includes('Dy6jo5j4goU2C4sc8Kwkk')
    expect(context.ids.removed).not.includes('Dy6jo5j4goU2C4sc8Kwkk')
    expect(context.maybeChanged.map(({ sys: { id } }) => id)).not.includes('Dy6jo5j4goU2C4sc8Kwkk')
  })
})
