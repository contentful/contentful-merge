import * as jsondiffpatch from '@contentful/jsondiffpatch'
import {Delta, Patch} from '@contentful/jsondiffpatch'
import {createClient} from 'contentful'
import {ListrTask} from 'listr2'
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

async function getEntryPatch(space: string, source: string, target: string, entry: string, accessToken: string): Promise<any> {
  const SourceCDAClient = createClient({
    accessToken,
    space,
    environment: source,
  })
  const TargetCDAClient = createClient({
    accessToken,
    space,
    environment: target,
  })

  const sourceEntry = await SourceCDAClient.getEntry(entry)
  const targetEntry = await TargetCDAClient.getEntry(entry)

  return format(entryDiff.diff(sourceEntry, targetEntry))
}

export const createFetchChangedTasks = ():ListrTask => {
  return {
    title: 'Fetch full payload for changed entities',
    task: async (context: CreateChangesetContext, task) => {
      const {ids, sourceEnvironmentId, changed, targetEnvironmentId, accessToken, spaceId} = context

      task.title = `Fetch full payload for ${changed.length} changed entities`

      const patches = []

      for (const changedElement of changed) {
        try {
          task.output = `create patch for entity ${changedElement.sys.id}`

          // eslint-disable-next-line no-await-in-loop
          const patch = await getEntryPatch(spaceId, sourceEnvironmentId, targetEnvironmentId, changedElement.sys.id, accessToken)
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
