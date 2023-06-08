import {create as createDiffer, Delta, formatters as diffFormatters} from 'jsondiffpatch'
import {ListrTask} from 'listr2'
import {chunk} from 'lodash'
import {BaseContext, ChangedChangeSetItem} from '../../types'
import {createLinkObject} from '../../utils/create-link-object'
import type {CreateChangesetContext} from '../types'
type Patch = unknown

// @ts-ignore jsondiffpatch does not have proper types
const format: (delta: Delta | undefined) => Patch = diffFormatters.jsonpatch.format

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

async function getEntriesPatches({
  context,
  source,
  target,
  entryIds,
}: GetEntryPatchParams): Promise<ChangedChangeSetItem[]> {
  const {client: {cda}} = context
  const query = {'sys.id[in]': entryIds.join(','), locale: '*'}

  const sourceEntries = await cda.entries.getMany({environment: source, query}).then(response => response.items)
  const targetEntries = await cda.entries.getMany({environment: target, query}).then(response => response.items)

  const result: ChangedChangeSetItem[] = []

  for (const entryId of entryIds) {
    const sourceEntry = sourceEntries.find(entry => entry.sys.id === entryId)
    const targetEntry = targetEntries.find(entry => entry.sys.id === entryId)

    if (sourceEntry && targetEntry) {
      const patch = format(entryDiff.diff(sourceEntry, targetEntry))
      result.push(
        {
          ...createLinkObject(entryId, 'changed'),
          patch,
        },
      )
    }
  }

  return result
}

export const createFetchChangedTasks = (): ListrTask => {
  return {
    title: 'Fetch full payload for changed entities',
    task: async (context: CreateChangesetContext, task) => {
      const {ids, sourceEnvironmentId, changed, targetEnvironmentId, statistics, limit, changeSet} = context
      task.title = `Fetch full payload for ${changed.length} changed entities`

      // TODO: use pLimit
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
        changeSet.items.push(...withChange)
      }

      changeSet.items.push(
        ...ids.removed.map(item => createLinkObject(item, 'deleted')),
        ...ids.added.map(item => createLinkObject(item, 'added')),
      )

      return Promise.resolve(context)
    },
  }
}
