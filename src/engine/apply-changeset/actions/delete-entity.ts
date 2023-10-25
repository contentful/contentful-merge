import { DeleteEntryError } from '../../errors'
import { BaseActionParams } from '../../types'

type CreateEntityParams = BaseActionParams & {
  id: string
}

export const deleteEntity = async ({
  client,
  id,
  environmentId,
  logger,
  responseCollector,
  task,
}: CreateEntityParams) => {
  try {
    /*
    const serverEntity = await client.cma.entries.get({entryId: id, environment: environmentId})
    if (!serverEntity) {
      return Promise.resolve()
    }
    */

    await client.cma.entries.unpublish({
      environment: environmentId,
      entryId: id,
    })

    await client.cma.entries.delete({
      environment: environmentId,
      entryId: id,
    })
    task.output = `✨ successfully deleted ${id}`
    logger.info(`entry ${id} successfully deleted on environment: ${environmentId}`)
    return id
  } catch (error: any) {
    task.output = `🚨 failed to delete ${id}`
    logger.error(`delete entry ${id} failed with ${error}`)
    responseCollector.add(error.code, error)

    throw new DeleteEntryError({ id, originalError: error.response?.data })
  }
}
