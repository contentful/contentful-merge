import { CreateChangesetContext } from '../../../../../src/engine/create-changeset/types'
import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { createChangesetTasks } from '../../../../../src/engine/create-changeset/tasks'
import { createCreateChangesetContext } from '../../../fixtures/create-changeset-context-fixture'
import { beforeEach } from 'mocha'
import { ContentModelDivergedError } from '../../../../../src/engine/errors'

const CONTENT_TYPE_ID = 'affected-content-type'

describe('affectedContentTypesDivergedTask', () => {
  let context: CreateChangesetContext
  beforeEach(() => {
    context = createCreateChangesetContext()
  })

  describe('with added content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.added.push(CONTENT_TYPE_ID)
    })

    describe('and deleted entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })

    describe('and added entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.sourceData.entries.comparables.push({
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
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.instanceOf(ContentModelDivergedError)
      })
      it('it ignores diverged content type for non-affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.sourceData.entries.comparables.push({
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
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })

    describe('and updated entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        const entry = {
          sys: {
            id: 'updated-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        }
        context.affectedEntities.entries.changed.push(entry.sys.id)
        context.sourceData.entries.comparables.push(entry)
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.instanceOf(ContentModelDivergedError)
      })

      it('it ignores diverged content type for non-affected entry', async () => {
        const entry = {
          sys: {
            id: 'updated-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        }
        context.affectedEntities.entries.changed.push(entry.sys.id)
        context.sourceData.entries.comparables.push(entry)
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })
  })

  describe('with deleted content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.removed.push(CONTENT_TYPE_ID)
    })

    // for deleted content type, only deleted entries are possible (no added or changed)
    describe('and deleted entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })
  })

  describe('with changed content type', () => {
    beforeEach(() => {
      context.affectedEntities.contentTypes.changed.push(CONTENT_TYPE_ID)
    })

    describe('and deleted entry', () => {
      it('it ignores any content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: CONTENT_TYPE_ID,
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
      it('it ignores non relevant content type changes for affected entries', async () => {
        context.affectedEntities.entries.removed.push('deleted-entry')
        context.targetData.entries.comparables.push({
          sys: {
            id: 'deleted-entry',
            updatedAt: '',
            contentType: {
              sys: {
                id: 'added-content-type-2',
              },
            },
          },
        })
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })

    describe('and added entry', () => {
      it('it detects relevant diverged content type for affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.sourceData.entries.comparables.push({
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
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.instanceOf(ContentModelDivergedError)
      })
      it('it ignores diverged content type for non-affected entry', async () => {
        context.affectedEntities.entries.added.push('added-entry')
        context.sourceData.entries.comparables.push({
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
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })

    describe('and updated entry', () => {
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
        context.affectedEntities.entries.changed.push(entry.sys.id)
        context.sourceData.entries.comparables.push(entry)
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.instanceOf(ContentModelDivergedError)
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
        context.affectedEntities.entries.changed.push(entry.sys.id)
        context.sourceData.entries.comparables.push(entry)
        const task = initializeTask(createChangesetTasks.affectedContentTypesDivergedTask(), context)
        let error = null
        try {
          await task.run()
        } catch (err) {
          error = err
        }

        expect(error).to.be.null
      })
    })
  })
})
