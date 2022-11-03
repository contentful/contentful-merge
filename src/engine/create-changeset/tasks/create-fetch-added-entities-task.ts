import {Entry} from 'contentful'
import {ListrTask} from 'listr2'
import {chunk, pick} from 'lodash'
import {CreateChangesetContext} from '../types'

function cleanEntity(entry: Entry<any>): any {
  return {...entry, sys: pick(entry.sys, ['id', 'type', 'revision', 'contentType', 'locale'])}
}

export function createFetchAddedEntitiesTask(shouldExecute: boolean): ListrTask {
  return {
    title: 'Fetch full payload for added entities',
    skip: !shouldExecute,
    task: async (context: CreateChangesetContext, task) => {
      const {client, ids: {added}, sourceEnvironmentId, changeSet, limit} = context
      task.title = `Fetch full payload for ${added.length} added entities`

      const idChunks = chunk(added, limit)
      let iterator = 0

      for (const chunk of idChunks) {
        task.output = `Fetching ${limit} entities ${++iterator * limit}/${added.length}`
        const query = {'sys.id[in]': chunk.join(','), locale: '*'}
        // eslint-disable-next-line no-await-in-loop
        const entries = await client.cda.entries.getMany({
          environment: sourceEnvironmentId,
          query,
        }).then(response => response.items)
        changeSet.items.push(...entries.map(entry => cleanEntity(entry)))
      }
    },
  }
}
