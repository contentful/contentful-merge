import { ListrTask } from 'listr2'
import { chunk } from 'lodash'
import { BaseContext, UpdatedChangesetItem, EntityType, EntryWithOptionalMetadata } from '../../types'
import { createLinkObject } from '../../utils/create-link-object'
import type { CreateChangesetContext } from '../types'
import { createPatch } from '../../utils/create-patch'
import { pluralizeEntry } from '../../utils/pluralize'
import { ContentType, Entry } from 'contentful'

type GetEntityPatchParams = {
  context: BaseContext
  source: string
  target: string
  entityIds: string[]
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
  entityIds,
  entityType,
}: GetEntityPatchParams): Promise<UpdatedChangesetItem[]> {
  const {
    client: { cda },
    contentType,
  } = context
  const query = { content_type: contentType, 'sys.id[in]': entityIds.join(','), locale: '*' }

  const api = cda[entityType]

  const sourceEntities = (await api.getMany({ environment: source, query }).then((response) => response.items)) as (
    | Entry<any>
    | ContentType
  )[]
  const targetEntities = (await api.getMany({ environment: target, query }).then((response) => response.items)) as (
    | Entry<any>
    | ContentType
  )[]

  const result: UpdatedChangesetItem[] = []

  for (const entityId of entityIds) {
    const sourceEntity = sourceEntities.find((entry) => entry.sys.id === entityId)
    const targetEntity = targetEntities.find((entry) => entry.sys.id === entityId)

    if (sourceEntity && targetEntity) {
      const isEntryWithOptionalMetadata = (entity: any): entity is EntryWithOptionalMetadata => {
        return entity && 'metadata' in entity
      }

      const cleanedSourceEntity = isEntryWithOptionalMetadata(sourceEntity)
        ? { ...sourceEntity, metadata: undefined }
        : sourceEntity

      const cleanedTargetEntity = isEntryWithOptionalMetadata(targetEntity)
        ? { ...targetEntity, metadata: undefined }
        : targetEntity

      const patch = createPatch({ targetEntity: cleanedTargetEntity, sourceEntity: cleanedSourceEntity })
      result.push({
        ...createLinkObject(entityId, 'update', EntityTypeMap[entityType]),
        patch,
      })
    }
  }

  return result
}

type FetchChangedTaskProps = {
  entityType: EntityType
}

export const createFetchChangedEntitiesTask = ({ entityType }: FetchChangedTaskProps): ListrTask => {
  return {
    title: `Fetching full payload for ${entityType} to be compared`,
    task: async (context: CreateChangesetContext, task) => {
      const { sourceEnvironmentId, affectedEntities, targetEnvironmentId, statistics, requestBatchSize, changeset } =
        context

      const entityTypeStatistics = statistics[entityType]

      const {
        [entityType]: { maybeChanged, added, removed, changed },
      } = affectedEntities

      const numberOfMaybeChanged = maybeChanged.length
      // TODO This task title is not completely accurate, as it could
      // also fetching content type payloads
      task.title = `Fetching full payload for ${numberOfMaybeChanged} ${pluralizeEntry(
        numberOfMaybeChanged,
      )} to be compared`

      const idChunks = chunk(
        maybeChanged.map((c) => c.sys.id),
        requestBatchSize,
      )

      let iterator = 0

      if (context.allowedOperations.includes('update')) {
        for await (const chunk of idChunks) {
          task.output = `Fetching ${requestBatchSize} ${entityType} ${
            ++iterator * requestBatchSize
          }/${numberOfMaybeChanged}`

          const changedObjects = await getEntityPatches({
            context,
            source: sourceEnvironmentId,
            target: targetEnvironmentId,
            entityIds: chunk,
            entityType,
          })

          const withChange = changedObjects.filter((o) => o.patch.length > 0)
          // changed means: entries have actual changed content
          entityTypeStatistics.changed += withChange.length
          // nonChanged means: entries have different sys.updatedAt but identical content
          entityTypeStatistics.nonChanged += changedObjects.length - withChange.length
          changed.push(...withChange.map((item) => item.entity.sys.id))
          if (entityType === 'entries') {
            changeset.items.push(...withChange)
          }
        }
      }

      const removedEntries = context.allowedOperations.includes('delete') ? removed : []
      const addedEntries = context.allowedOperations.includes('add') ? added : []

      if (entityType === 'entries') {
        changeset.items.push(
          ...removedEntries.map((item) => createLinkObject(item, 'delete', EntityTypeMap[entityType])),
          ...addedEntries.map((item) => createLinkObject(item, 'add', EntityTypeMap[entityType])),
        )
      }

      entityTypeStatistics.removed = removedEntries.length
      entityTypeStatistics.added = addedEntries.length

      return Promise.resolve(context)
    },
  }
}
