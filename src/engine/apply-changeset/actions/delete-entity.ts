import {LogLevel} from '../../logger/types'
import {BaseActionParams} from '../../types'

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
    task.output = `✨successfully deleted ${id}`
    logger.log(LogLevel.INFO, `entry ${id} successfully deleted on environment: ${environmentId}`)
  } catch (error: any) {
    task.output = `🚨failed to delete ${id}`
    logger.log(LogLevel.ERROR, `delete entry ${id} failed with ${error}`)
    responseCollector.add(error.code, error)
  }
}
