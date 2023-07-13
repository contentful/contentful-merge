import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createAffectedContentTypesDivergedTask } from '../../../../../src/engine/create-changeset/tasks/create-affected-content-types-diverged-task'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'
import { beforeEach } from 'mocha'

const CONTENT_TYPE_ID = 'affected-content-type'

describe('createAffectedContentTypesDivergedTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext()
  })

  describe('with added content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.added.push(CONTENT_TYPE_ID)
    })

    describe('and removed entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and added entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })
      it('it ignores diverged content type for non-affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and changed entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })

      it('it ignores diverged content type for non-affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })
  })

  describe('with removed content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.removed.push(CONTENT_TYPE_ID)
    })

    describe('and removed entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and added entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })
      it('it ignores diverged content type for non-affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and changed entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })

      it('it ignores diverged content type for non-affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })
  })

  describe('with changed content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.maybeChanged.push({
        sys: { id: CONTENT_TYPE_ID, updatedAt: '' },
      })
    })

    describe('and removed entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('removed-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'removed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and added entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })
      it('it ignores diverged content type for non-affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'added-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })

    describe('and changed entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.true
      })

      it('it ignores diverged content type for non-affected entry', async () => {
        const entry = {
          sys: {
            id: 'changed-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        }
        context.affectedEntities.entries.maybeChanged.push(entry)
        context.targetData.entries.comparables.push(entry)
        const task = initializeTask(createAffectedContentTypesDivergedTask(), context)
        await task.run()
        expect(context.contentModelDiverged).to.false
      })
    })
  })
})
