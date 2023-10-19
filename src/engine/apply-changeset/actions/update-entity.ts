import jsonpatch from 'fast-json-patch'
import { LogLevel } from '../../logger/types'
import { BaseActionParams, UpdatedChangesetItem } from '../../types'
import { UpdateEntryError } from '../../errors'

type UpdateEntityParams = BaseActionParams & {
  item: UpdatedChangesetItem
}

export const updateEntity = async ({
  client,
  item,
  environmentId,
  logger,
  responseCollector,
  task,
}: UpdateEntityParams) => {
  try {
    const serverEntity = await client.cma.entries.get({ entryId: item.entity.sys.id, environment: environmentId })
    if (!serverEntity) {
      return Promise.resolve()
    }

    const patchEntry = jsonpatch.applyPatch(serverEntity, item.patch).newDocument

    const updatedEntry = await client.cma.entries.update({
      environment: environmentId,
      entryId: item.entity.sys.id,
      contentType: patchEntry.sys.contentType.sys.id,
      entry: patchEntry,
    })

    await client.cma.entries.publish({
      environment: environmentId,
      entryId: updatedEntry.sys.id,
      entryVersion: updatedEntry.sys.version,
    })
    task.output = `✨ successfully updated ${item.entity.sys.id}`
    logger.log(LogLevel.INFO, `entry ${item.entity.sys.id} successfully updated on environment: ${environmentId}`)
    return item.entity.sys.id
  } catch (error: any) {
    task.output = `🚨 failed to update ${item.entity.sys.id}`
    logger.log(LogLevel.ERROR, `update entry ${item.entity.sys.id} failed with ${error}`)
    responseCollector.add(error.code, error)

    throw new UpdateEntryError({ id: item.entity.sys.id, originalError: error.response?.data })
  }
}
