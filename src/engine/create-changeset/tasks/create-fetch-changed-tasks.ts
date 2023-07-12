import { ListrTask } from 'listr2'
import { chunk } from 'lodash'
import { BaseContext, ChangedChangesetItem, EntityType } from '../../types'
import { createLinkObject } from '../../utils/create-link-object'
import type { CreateChangesetContext } from '../types'
import { createPatch } from '../../utils/create-patch'
import { pluralizeEntries } from '../../utils/pluralize-entries'
import { SkipHandler } from '../types'

type GetEntryPatchParams = {
  context: BaseContext
  source: string
  target: string
  entryIds: string[]
  entityType: EntityType
}

const EntityTypeMap: Record<EntityType, 'Entry' | 'ContentType'> = {
  entries: 'Entry',
  contentTypes: 'ContentType',
}

async function getEntityPatches({
  context,
  source,
  target,
  entryIds,
  entityType,
}: GetEntryPatchParams): Promise<ChangedChangesetItem[]> {
  const {
    client: { cda },
  } = context
  const query = { 'sys.id[in]': entryIds.join(','), locale: '*' }

  const api = cda[entityType]

  const sourceEntries = await api.getMany({ environment: source, query }).then((response) => response.items)
  const targetEntries = await api.getMany({ environment: target, query }).then((response) => response.items)

  const result: ChangedChangesetItem[] = []

  for (const entryId of entryIds) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const sourceEntry = sourceEntries.find((entry) => entry.sys.id === entryId)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const targetEntry = targetEntries.find((entry) => entry.sys.id === entryId)

    if (sourceEntry && targetEntry) {
      const patch = createPatch({ targetEntry, sourceEntry })
      result.push({
        ...createLinkObject(entryId, 'changed', EntityTypeMap[entityType]),
        patch,
      })
    }
  }

  return result
}

type FetchChangedTaskProps = {
  entityType: EntityType
  skipHandler: SkipHandler
}

export const createFetchChangedTasks = ({ entityType, skipHandler }: FetchChangedTaskProps): ListrTask => {
  return {
    title: `Fetching full payload for ${entityType} to be compared`,
    skip: skipHandler,
    task: async (context: CreateChangesetContext, task) => {
      const { sourceEnvironmentId, affectedEntities, targetEnvironmentId, statistics, limit, changeset } = context

      const {
        [entityType]: { maybeChanged, added, removed },
      } = affectedEntities

      const numberOfMaybeChanged = maybeChanged.length
      task.title = `Fetching full payload for ${numberOfMaybeChanged} ${pluralizeEntries(
        numberOfMaybeChanged
      )} to be compared`

      // TODO: use pLimit
      const idChunks = chunk(
        maybeChanged.map((c) => c.sys.id),
        limit ?? 1000
      )

      let iterator = 0

      for (const chunk of idChunks) {
        task.output = `Fetching ${limit} ${entityType} ${++iterator * limit}/${numberOfMaybeChanged}`
        // eslint-disable-next-line no-await-in-loop
        const changedObjects = await getEntityPatches({
          context,
          source: sourceEnvironmentId,
          target: targetEnvironmentId,
          entryIds: chunk,
          entityType,
        })

        const withChange = changedObjects.filter((o) => o.patch.length > 0)
        // changed means: entries have actual changed content
        statistics.changed += withChange.length
        // nonChanged means: entries have different sys.updatedAt but identical content
        statistics.nonChanged += changedObjects.length - withChange.length
        changeset.items.push(...withChange)
      }

      changeset.items.push(
        ...removed.map((item) => createLinkObject(item, 'deleted', EntityTypeMap[entityType])),
        ...added.map((item) => createLinkObject(item, 'added', EntityTypeMap[entityType]))
      )

      statistics.added = added.length
      statistics.removed = removed.length

      return Promise.resolve(context)
    },
  }
}
