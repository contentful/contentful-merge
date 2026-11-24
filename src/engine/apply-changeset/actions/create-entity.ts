import { EntryProps } from 'contentful-management'
import { omit } from 'lodash'
import { AddedChangesetItem, BaseActionParams } from '../../types'
import { AddEntryError } from '../../errors'

type CreateEntityParams = BaseActionParams & {
  item: AddedChangesetItem
}

const isVersionMismatchError = (error: any) => error.response?.data?.sys?.id?.includes('VersionMismatch')

const getContentTypeId = (entry: EntryProps) => entry.sys.contentType.sys.id

const updateExistingDraftEntry = async ({
  client,
  item,
  environmentId,
  logger,
}: Omit<CreateEntityParams, 'responseCollector' | 'task'>) => {
  const data = item.data as EntryProps
  const existingEntry = await client.cma.entries.get({ entryId: item.entity.sys.id, environment: environmentId })
  const contentType = getContentTypeId(data)

  if (getContentTypeId(existingEntry) !== contentType) {
    throw new Error(
      `Entry ${item.entity.sys.id} already exists in the target environment with a different content type.`,
    )
  }
  if (existingEntry.sys.publishedVersion) {
    throw new Error(`Entry ${item.entity.sys.id} already exists as a published entry in the target environment.`)
  }

  logger.info(
    `entry ${item.entity.sys.id} already exists on environment: ${environmentId}. Updating existing draft entry instead.`,
  )

  return client.cma.entries.update({
    environment: environmentId,
    entryId: item.entity.sys.id,
    contentType,
    entry: {
      ...existingEntry,
      fields: data.fields,
    },
  })
}

export const createEntity = async ({
  client,
  item,
  environmentId,
  logger,
  responseCollector,
  task,
}: CreateEntityParams) => {
  try {
    const createdEntry = await client.cma.entries.create({
      environment: environmentId,
      entryId: item.entity.sys.id,
      entry: omit(item.data as EntryProps, ['sys']),
      contentType: (item.data as EntryProps).sys.contentType.sys.id,
    })

    task.output = `✨ successfully created ${createdEntry.sys.id}`
    logger.info(`entry ${item.entity.sys.id} successfully published on environment: ${environmentId}`)
    return createdEntry
  } catch (error: any) {
    if (isVersionMismatchError(error)) {
      try {
        const updatedEntry = await updateExistingDraftEntry({ client, item, environmentId, logger })

        task.output = `✨ successfully updated existing draft ${updatedEntry.sys.id}`
        return updatedEntry
      } catch (fallbackError: any) {
        logger.error(`add entry ${item.entity.sys.id} fallback update failed with ${fallbackError}`)
      }
    }

    task.output = `🚨 failed to create ${item.entity.sys.id}`
    logger.error(`add entry ${item.entity.sys.id} failed with ${error}`)
    responseCollector.add(error.code, error)

    throw new AddEntryError({ id: item.entity.sys.id, originalError: error.response?.data })
  }
}
