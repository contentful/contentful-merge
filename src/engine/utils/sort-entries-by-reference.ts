import { AddedChangesetItem } from '../types'
import { FieldsType } from 'contentful'

type LinksPerEntry = { index: number; linkIndexes: number[] }
type CompareFunction = ((a: LinksPerEntry) => number) | ((a: LinksPerEntry, b: LinksPerEntry) => number)

/**
 * This function was inspired by the sortEntries function in contentful-import
 * https://github.com/contentful/contentful-import/blob/028ba2cf1a0df9415da5f0608adb8a24e0428a98/lib/utils/sort-entries.ts
 * Given a list of entries, this function reorders them so that entries which
 * are linked from other entries always come first in the order. This ensures
 * that when we publish the newly added entries, we are not publishing entries
 * which contain links to other entries that haven't been published yet.
 */
export default function sortEntriesByReference(entries: AddedChangesetItem[]): AddedChangesetItem[] {
  const linkedEntries = getLinkedEntries(entries)

  const mergedLinkedEntries = mergeSort(linkedEntries, (a: LinksPerEntry) => {
    return hasLinkedIndexesInFront(a)
  })

  return mergedLinkedEntries.map((linkInfo: LinksPerEntry) => entries[linkInfo.index])

  function hasLinkedIndexesInFront(item: LinksPerEntry): number {
    if (hasLinkedIndexes(item)) {
      return item.linkIndexes.some((index) => index > item.index) ? 1 : -1
    }
    return 0
  }

  function hasLinkedIndexes(item: LinksPerEntry): boolean {
    return item.linkIndexes.length > 0
  }
}

function getLinkedEntries(entries: AddedChangesetItem[]): LinksPerEntry[] {
  return entries.map((entry: AddedChangesetItem, entryIndex: number) => {
    const fieldsArray = Object.values(entry.data.fields as FieldsType)
    const rawLinks = fieldsArray.map((field: FieldsType) => {
      field = Object.values(field)[0]
      if (isEntryLink(field)) {
        return getFieldEntriesIndex(field, entries)
      } else if (isEntryArrayLink(field)) {
        return field.map((item: FieldsType) => getFieldEntriesIndex(item, entries))
      } else if (isRichTextField(field)) {
        const links = extractLinksFromContent(field)
        return links.map((item: FieldsType) => getFieldEntriesIndex(item, entries))
      }
    })

    return {
      index: entryIndex,
      linkIndexes: rawLinks.flat().filter((index: number) => index >= 0) as number[],
    }
  })
}

function getFieldEntriesIndex(field: FieldsType, entries: AddedChangesetItem[]): number {
  const { id } = field.sys
  return entries.findIndex((entry) => entry.data.sys.id === id)
}

function isEntryLink(item: FieldsType): boolean {
  return item?.sys?.type === 'Entry' || item?.sys?.linkType === 'Entry'
}

function isEntryArrayLink(item: FieldsType): boolean {
  return Array.isArray(item) && item.length > 0 && isEntryLink(item[0])
}

function isRichTextField(item: FieldsType): boolean {
  return item.nodeType === 'document'
}

function extractLinksFromContent({
  content,
  data: {
    sys: { id: sourceId },
  },
}: FieldsType) {
  const links = content.reduce((acc: FieldsType[], field: FieldsType) => {
    if (['embedded-entry-block', 'embedded-entry-inline', 'entry-hyperlink'].includes(field.nodeType)) {
      const { id: targetId } = field.data.target.sys
      if (targetId !== sourceId) {
        acc.push(field.data.target)
      }
    } else if (field.content?.length) {
      const linksFromContent = extractLinksFromContent(field)
      acc.push(...linksFromContent)
    }
    return acc
  }, [])

  return links
}

/**
 * From https://github.com/millermedeiros/amd-utils/blob/master/src/array/sort.js
 * MIT Licensed
 * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
 * @version 0.1.0 (2012/05/23)
 */
function mergeSort(arr: LinksPerEntry[], compareFn: CompareFunction): LinksPerEntry[] {
  if (arr.length < 2) return arr

  if (compareFn == null) compareFn = defaultCompare

  const mid = ~~(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid), compareFn)
  const right = mergeSort(arr.slice(mid, arr.length), compareFn)

  return merge(left, right, compareFn)
}

function defaultCompare(a: LinksPerEntry, b: LinksPerEntry): -1 | 1 | 0 {
  return a < b ? -1 : a > b ? 1 : 0
}

function merge(left: LinksPerEntry[], right: LinksPerEntry[], compareFn: CompareFunction): LinksPerEntry[] {
  const result: LinksPerEntry[] = []

  while (left.length > 0 && right.length > 0) {
    if (compareFn(left[0], right[0]) <= 0) {
      // if 0 it should preserve same order (stable)
      result.push(left.shift() as LinksPerEntry)
    } else {
      result.push(right.shift() as LinksPerEntry)
    }
  }

  if (left.length) result.push(...left)
  if (right.length) result.push(...right)

  return result
}
