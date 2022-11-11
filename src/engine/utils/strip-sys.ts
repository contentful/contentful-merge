import {omit} from 'lodash'

export const stripSys = (entity: Record<string, any>): any => {
  return omit(entity, ['sys'])
}
