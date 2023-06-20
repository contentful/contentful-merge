import { Entry } from 'contentful'
import { create as createDiffer, Delta, formatters as diffFormatters, Patch } from '@contentful/jsondiffpatch'

const format: (delta: Delta | undefined) => Patch = diffFormatters.jsonpatch.format

const entryDiff = createDiffer({
  propertyFilter: function (name: string) {
    return !['sys'].includes(name)
  },
  textDiff: {
    minLength: Number.MAX_SAFE_INTEGER,
  },
})

export const createPatch = ({ targetEntry, sourceEntry }: { targetEntry: Entry<any>; sourceEntry: Entry<any> }) => {
  return format(entryDiff.diff(targetEntry, sourceEntry))
}
