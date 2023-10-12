import { ApplyChangesetContext } from '../apply-changeset/types'
import { ContainsMetadataError } from '../errors'

export const containsMetadata = (context: ApplyChangesetContext) => {
  const { changeset } = context
  const entries = changeset.items

  // We are currently not supporting metadata in changesets therefore we check if the changeset contains metadata
  for (let i = 0; i < entries.length; i++) {
    const item = entries[i]
    if (item.changeType === 'update') {
      if (item.patch.some((i) => i.path.startsWith('/metadata'))) {
        throw new ContainsMetadataError(item.entity.sys.id)
      }
    } else if (item.changeType === 'add') {
      if (item.data.metadata) {
        throw new ContainsMetadataError(item.entity.sys.id)
      }
    }
  }
}
