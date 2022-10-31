import {Command, Flags} from '@oclif/core'
import {createClient} from '../../engine/client'
import {createChangeset} from '../../engine/create-changeset'
import {CreateChangesetContext} from '../../engine/create-changeset/types'
import * as fs from 'node:fs/promises'

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  static examples = [
    './bin/dev create --space "<space-id>" --source "master>" --target "staging" --token "<cda-token>"',
    'ccccli create --space "<space-id>" --source "master" --target "staging" --token "<cda-token>"',
  ]

  static flags = {
    source: Flags.string({description: 'source environment id', required: true}),
    target: Flags.string({description: 'target environment id', required: true}),
    space: Flags.string({description: 'space id', required: true}),
    token: Flags.string({description: 'cda token', required: true}),
    inline: Flags.boolean({description: 'inline added entity payload', required: false}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Create)

    const client = createClient({
      accessToken: flags.token,
      space: flags.space,
    })

    const context: CreateChangesetContext = {
      client,
      accessToken: flags.token,
      spaceId: flags.space,
      sourceEnvironmentId: flags.source,
      targetEnvironmentId: flags.target,
      inline: flags.inline,
      source: {comparables: [], ids: []},
      target: {comparables: [], ids: []},
      ids: {
        added: [],
        removed: [],
      },
      changed: [],
      statistics: {
        nonChanged: 0,
      },
    }

    const result = await createChangeset(context).run()

    const printable = {
      numbers: {
        statistics: {...result.statistics, 'http-requests': client.requestCounts()},
        'source-entities': result.source.ids.length,
        'target-entities': result.target.ids.length,
        changed: result.changeset.changed.length,
        removed: result.changeset.removed.length,
        added: result.changeset.added.length,
      },
    }

    console.log(JSON.stringify(printable, null, 2))
    await fs.writeFile('./changeset.json', JSON.stringify(result.changeset, null, 2))
  }
}
