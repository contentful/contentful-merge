import {formatters as diffFormatters, create as createDiffer} from '@contentful/jsondiffpatch'
import {Delta, Patch} from '@contentful/jsondiffpatch'
import {ListrTask} from 'listr2'
import {chunk} from 'lodash'
import {BaseContext, ChangedResult, EntryLink} from '../types'
import type {CreateChangesetContext} from '../types'

const format: (delta: Delta | undefined) => Patch = diffFormatters.jsonpatch.format

const createLinkObject = (id: string): EntryLink => ({
  type: 'Link',
  linkType: 'Entry',
  id,
})

const entryDiff = createDiffer({
  propertyFilter: function (name: string) {
    return !['sys'].includes(name)
  },
  textDiff: {
    minLength: Number.MAX_SAFE_INTEGER,
  },
})

type GetEntryPatchParams = {
  context: BaseContext,
  source: string,
  target: string,
  entryIds: string[],
}

async function getEntriesPatches({context, source, target, entryIds}: GetEntryPatchParams): Promise<ChangedResult[]> {
  const {client: {cda}} = context
  const query = {'sys.id[in]': entryIds.join(','), locale: '*'}

  const sourceEntries = await cda.entries.getMany({environment: source, query}).then(response => response.items)
  const targetEntries = await cda.entries.getMany({environment: target, query}).then(response => response.items)

  const patches: ChangedResult[] = []

  for (const entryId of entryIds) {
    const sourceEntry = sourceEntries.find(entry => entry.sys.id === entryId)
    const targetEntry = targetEntries.find(entry => entry.sys.id === entryId)

    if (sourceEntry && targetEntry) {
      patches.push(
        {
          entity: createLinkObject(entryId),
          patch: format(entryDiff.diff(sourceEntry, targetEntry)),
        },
      )
    }
  }

  return patches
}

export const createFetchChangedTasks = (): ListrTask => {
  return {
    title: 'Fetch full payload for changed entities',
    task: async (context: CreateChangesetContext, task) => {
      const {ids, sourceEnvironmentId, changed, targetEnvironmentId, statistics, limit} = context

      task.title = `Fetch full payload for ${changed.length} changed entities`

      const patches: any[] = []

      const idChunks = chunk(changed.map(c => c.sys.id), limit)

      let iterator = 0

      for (const chunk of idChunks) {
        task.output = `Fetching ${limit} entities ${++iterator * limit}/${changed.length}`
        // eslint-disable-next-line no-await-in-loop
        const changedObjects = await getEntriesPatches({
          context,
          source: sourceEnvironmentId,
          target: targetEnvironmentId,
          entryIds: chunk,
        })

        const withChange = changedObjects.filter(o => o.patch.length > 0)
        statistics.nonChanged += changedObjects.length - withChange.length
        patches.push(...withChange)
      }

      context.changeset = {
        removed: ids.removed.map(item => createLinkObject(item)),
        added: ids.added.map(item => createLinkObject(item)),
        changed: patches,
      }
      return Promise.resolve(context)
    },
  }
}
