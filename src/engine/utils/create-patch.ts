import { ContentType } from 'contentful'
import { generateJSONPatch, pathInfo } from 'generate-json-patch'
import { EntryWithOptionalMetadata } from '../types'

export const createPatch = ({
  targetEntity: targetEntry,
  sourceEntity: sourceEntry,
}: {
  targetEntity: EntryWithOptionalMetadata | ContentType
  sourceEntity: EntryWithOptionalMetadata | ContentType
}) => {
  // Temp ignore until the types from generate-json-patch are fixed
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return generateJSONPatch(targetEntry, sourceEntry, {
    propertyFilter: function (name: string, context) {
      const { length } = pathInfo(context.path)
      // only create patch for `fields` property
      if (length === 1) {
        return name === 'fields'
      }
      return true
    },
  })
}
