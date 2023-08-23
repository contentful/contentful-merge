import { EntryProps } from 'contentful-management'
import { omit } from 'lodash'
import { LogLevel } from '../../logger/types'
import { AddedChangesetItem, BaseActionParams } from '../../types'

type CreateEntityParams = BaseActionParams & {
  item: AddedChangesetItem
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
    logger.log(LogLevel.INFO, `entry ${item.entity.sys.id} successfully published on environment: ${environmentId}`)
    return item.entity.sys.id
  } catch (error: any) {
    task.output = `🚨 failed to create ${item.entity.sys.id}`
    logger.log(LogLevel.ERROR, `add entry ${item.entity.sys.id} failed with ${error}`)
    responseCollector.add(error.code, error)
  }
}
