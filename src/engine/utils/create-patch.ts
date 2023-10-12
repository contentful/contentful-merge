import { Entry } from 'contentful'
import { generateJSONPatch, pathInfo } from 'generate-json-patch'

export const createPatch = ({ targetEntry, sourceEntry }: { targetEntry: Entry<any>; sourceEntry: Entry<any> }) => {
  // Temp fix until the types from generate-json-patch are fixed
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return generateJSONPatch(targetEntry, sourceEntry, {
    propertyFilter: function (name: string, context) {
      const { length } = pathInfo(context.path)
      // ignore sys prop on root level
      if (length === 1) {
        return !['sys'].includes(name)
      }
      return true
    },
  })
}
