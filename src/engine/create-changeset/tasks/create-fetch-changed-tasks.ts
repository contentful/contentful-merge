import * as jsondiffpatch from '@contentful/jsondiffpatch'
import {Delta, Patch} from '@contentful/jsondiffpatch'
import {ListrTask} from 'listr2'
import {BaseContext} from '../types'
import type {CreateChangesetContext} from '../types'

const format: (delta: Delta | undefined) => Patch = jsondiffpatch.formatters.jsonpatch.format

const createLinkObject = (id: string) => ({
  sys: {
    type: 'Link',
    linkType: 'Entry',
    id,
  },
})

const entryDiff = jsondiffpatch.create({
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
  entry: string,
}

async function getEntryPatch({context, source, target, entry}: GetEntryPatchParams): Promise<any> {
  const {client} = context

  context.requestCount++
  const sourceEntry = await client.entries.get({environment: source, entryId: entry})
  context.requestCount++
  const targetEntry = await client.entries.get({environment: target, entryId: entry})

  return format(entryDiff.diff(sourceEntry, targetEntry))
}

export const createFetchChangedTasks = (): ListrTask => {
  return {
    title: 'Fetch full payload for changed entities',
    task: async (context: CreateChangesetContext, task) => {
      const {ids, sourceEnvironmentId, changed, targetEnvironmentId} = context

      task.title = `Fetch full payload for ${changed.length} changed entities`

      const patches = []

      // TODO: execute in parallel
      for (const changedElement of changed) {
        try {
          task.output = `create patch for entity ${changedElement.sys.id}`

          // eslint-disable-next-line no-await-in-loop
          const patch = await getEntryPatch({
            context,
            source: sourceEnvironmentId,
            target: targetEnvironmentId,
            entry: changedElement.sys.id,
          })
          patches.push({
            entity: createLinkObject(changedElement.sys.id),
            patch,
          })
        } catch {
          console.warn('no entry found for ' + changedElement.sys.id)
        }
      }

      context.changeset = {
        removed: ids.removed.map(item => createLinkObject(item)),
        added: ids.added.map(item => createLinkObject(item)),
        changed: patches,
      }
      return Promise.resolve(context)
    },
  }
}
