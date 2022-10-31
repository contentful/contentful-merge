import {Command, Flags} from '@oclif/core'
import {createClient} from '../../engine/client'
import {createChangeset} from '../../engine/create-changeset'
import {CreateChangesetContext} from '../../engine/create-changeset/types'

export default class Create extends Command {
  static description = 'Create Entries Changeset'

  static examples = [
    './bin/dev create --space "gll3dpy2vz3q" --source "master" --target "staging" --token "J2ukTAMw_l6O1Vj13dsqnstFtLuFW4lPr0s3GiilzNU"',
    './bin/dev create --space "96t1bbcqaoy8" --source "master" --target "import" --token "2AwMuY1CAy_EvpixuDkHkKDDBmuReuOWZ-a-J3qzmWE"',
    'ccccli create --space "gll3dpy2vz3q" --source "master" --target "staging" --token "J2ukTAMw_l6O1Vj13dsqnstFtLuFW4lPr0s3GiilzNU"',
  ]

  static flags = {
    source: Flags.string({description: 'source environment id', required: true}),
    target: Flags.string({description: 'target environment id', required: true}),
    space: Flags.string({description: 'space id', required: true}),
    token: Flags.string({description: 'space id', required: true}),
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
      requestCount: 0,
      source: {comparables: [], ids: []},
      target: {comparables: [], ids: []},
      ids: {
        added: [],
        removed: [],
      },
      changed: [],
    }

    const result = await createChangeset(context).run()

    const printable = {
      requests: result.requestCount,
      changed: result.changeset.changed.length,
      removed: result.changeset.removed.length,
      added: result.changeset.added.length,
    }

    console.log(JSON.stringify(printable, null, 2))
  }
}
