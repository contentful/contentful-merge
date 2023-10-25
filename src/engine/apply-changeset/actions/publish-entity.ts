import { EntryProps } from 'contentful-management'
import { BaseActionParams } from '../../types'
import { PublishEntryError } from '../../errors'

type PublishEntity = BaseActionParams & {
  entity: EntryProps
}

export const publishEntity = async ({
  client,
  entity,
  environmentId,
  logger,
  responseCollector,
  task,
}: PublishEntity) => {
  try {
    await client.cma.entries.publish({
      environment: environmentId,
      entryId: entity.sys.id,
      entryVersion: entity.sys.version,
    })

    task.output = `✨ successfully published ${entity.sys.id}`
    logger.info(`entry ${entity.sys.id} successfully published on environment: ${environmentId}`)
    return entity.sys.id
  } catch (error: any) {
    task.output = `🚨 failed to publish ${entity.sys.id}`
    logger.error(`publish entry ${entity.sys.id} failed with ${error}`)
    responseCollector.add(error.code, error)

    throw new PublishEntryError({ id: entity.sys.id, originalError: error.response?.data })
  }
}
