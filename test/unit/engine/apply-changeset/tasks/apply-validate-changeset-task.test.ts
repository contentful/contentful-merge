import { initializeTask } from '../../../test-utils'
import { expect } from 'chai'
import { applyValidateChangesetTask } from '../../../../../src/engine/apply-changeset/tasks/create-validate-changeset-taskk'
import { beforeEach } from 'mocha'
import { AddedChangesetItem, UpdatedChangesetItem } from '../../../../../src/engine/types'
import { createLinkObject } from '../../../../../src/engine/utils/create-link-object'
import { createApplyChangesetContext } from '../../../fixtures/apply-changeset-context-fixture'
import { ApplyChangesetContext } from '../../../../../src/engine/apply-changeset/types'
import { ContainsMetadataError } from '../../../../../src/engine/errors'

describe('applyValidateChangesetTask', () => {
  let context: ApplyChangesetContext
  beforeEach(() => {
    context = createApplyChangesetContext()
  })

  describe('validates metadata', () => {
    it('and throws error for metadata in update patch', async () => {
      const updatedChangesetItem: UpdatedChangesetItem = {
        ...createLinkObject('update-entry', 'update', 'Entry'),
        patch: [
          {
            op: 'add',
            path: '/metadata/tags/0',
            value: {
              sys: {
                type: 'Link',
                linkType: 'Tag',
                id: 'myPublicTag',
              },
            },
          },
        ],
      }

      context.changeset.items.push(updatedChangesetItem)

      const task = initializeTask(applyValidateChangesetTask(), context)
      let error: ContainsMetadataError | null = null
      try {
        await task.run()
      } catch (err) {
        error = err as ContainsMetadataError
      }

      expect(error).to.be.not.null
      expect(error!.message).to.contain('Metadata in changesets is currently not supported')
    })

    it('and throws error for metadata in add data', async () => {
      const addedChangesetItem: AddedChangesetItem = createLinkObject('added-entry', 'add', 'Entry')

      addedChangesetItem.data = {
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
          id: 'added-entry',
          type: 'Entry',
          createdAt: '2023-05-17T10:36:22.538Z',
          updatedAt: '2023-05-17T10:36:40.280Z',
          environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
          revision: 1,
          contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
        },
        fields: {},
        metadata: {
          tags: [
            {
              sys: {
                type: 'Link',
                linkType: 'Tag',
                id: 'myPublicTag',
              },
            },
          ],
        },
      }

      context.changeset.items.push(addedChangesetItem)

      const task = initializeTask(applyValidateChangesetTask(), context)
      let error: ContainsMetadataError | null = null
      try {
        await task.run()
      } catch (err) {
        error = err as ContainsMetadataError
      }

      expect(error).to.be.not.null
      expect(error!.message).to.contain('Metadata in changesets is currently not supported')
    })

    it('and succeeds when there is no metadata in the patch', async () => {
      const updatedChangesetItem: UpdatedChangesetItem = {
        ...createLinkObject('update-entry', 'update', 'Entry'),
        patch: [],
      }

      context.changeset.items.push(updatedChangesetItem)

      const addedChangesetItem: AddedChangesetItem = createLinkObject('added-entry', 'add', 'Entry')

      addedChangesetItem.data = {
        sys: {
          space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
          id: 'added-entry',
          type: 'Entry',
          createdAt: '2023-05-17T10:36:22.538Z',
          updatedAt: '2023-05-17T10:36:40.280Z',
          environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
          revision: 1,
          contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
        },
        fields: {},
      }

      context.changeset.items.push(addedChangesetItem)

      const task = initializeTask(applyValidateChangesetTask(), context)
      let error: ContainsMetadataError | null = null
      try {
        await task.run()
      } catch (err) {
        error = err as ContainsMetadataError
      }

      expect(error).to.be.null
    })
  })
})
