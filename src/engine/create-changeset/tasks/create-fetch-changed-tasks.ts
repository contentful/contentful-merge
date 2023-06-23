import { ListrTask } from 'listr2'
import { chunk } from 'lodash'
import { BaseContext, ChangedChangesetItem } from '../../types'
import { createLinkObject } from '../../utils/create-link-object'
import type { CreateChangesetContext } from '../types'
import { createPatch } from '../../utils/create-patch'
import { pluralizeEntries } from '../../utils/pluralize-entries'

type GetEntryPatchParams = {
  context: BaseContext
  source: string
  target: string
  entryIds: string[]
}

async function getEntriesPatches({
  context,
  source,
  target,
  entryIds,
}: GetEntryPatchParams): Promise<ChangedChangesetItem[]> {
  const {
    client: { cda },
  } = context
  const query = { 'sys.id[in]': entryIds.join(','), locale: '*' }

  const sourceEntries = await cda.entries.getMany({ environment: source, query }).then((response) => response.items)
  const targetEntries = await cda.entries.getMany({ environment: target, query }).then((response) => response.items)

  const result: ChangedChangesetItem[] = []

  for (const entryId of entryIds) {
    const sourceEntry = sourceEntries.find((entry) => entry.sys.id === entryId)
    const targetEntry = targetEntries.find((entry) => entry.sys.id === entryId)

    if (sourceEntry && targetEntry) {
      const patch = createPatch({ targetEntry, sourceEntry })
      result.push({
        ...createLinkObject(entryId, 'changed'),
        patch,
      })
    }
  }

  return result
}

export const createFetchChangedTasks = (): ListrTask => {
  return {
    title: 'Fetching full payload for changed entries',
    skip: (context: CreateChangesetContext) => context.exceedsLimits === true,
    task: async (context: CreateChangesetContext, task) => {
      const { ids, sourceEnvironmentId, maybeChanged, targetEnvironmentId, statistics, limit, changeset } = context
      const numberOfMaybeChanged = maybeChanged.length
      task.title = `Fetching full payload for ${numberOfMaybeChanged} changed ${pluralizeEntries(numberOfMaybeChanged)}`

      // TODO: use pLimit
      const idChunks = chunk(
        maybeChanged.map((c) => c.sys.id),
        limit
      )

      let iterator = 0

      for (const chunk of idChunks) {
        task.output = `Fetching ${limit} entities ${++iterator * limit}/${numberOfMaybeChanged}`
        // eslint-disable-next-line no-await-in-loop
        const changedObjects = await getEntriesPatches({
          context,
          source: sourceEnvironmentId,
          target: targetEnvironmentId,
          entryIds: chunk,
        })

        const withChange = changedObjects.filter((o) => o.patch.length > 0)
        statistics.nonChanged += changedObjects.length - withChange.length
        changeset.items.push(...withChange)
      }

      changeset.items.push(
        ...ids.removed.map((item) => createLinkObject(item, 'deleted')),
        ...ids.added.map((item) => createLinkObject(item, 'added'))
      )

      return Promise.resolve(context)
    },
    skip: (context) => exceedsLimitsForType('changed', context),
  }
}
