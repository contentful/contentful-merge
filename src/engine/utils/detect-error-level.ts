import {
  ChangesetFileError,
  ContainsMetadataError,
  ContentModelDivergedError,
  LimitsExceededForApplyError,
  LimitsExceededForCreateError,
  LocaleMissingForApplyError,
} from '../errors'
import { SeverityLevel } from '@sentry/types/types/severity'

const WarnErrorClasses = [
  LimitsExceededForCreateError,
  LimitsExceededForApplyError,
  LocaleMissingForApplyError,
  ContentModelDivergedError,
  ChangesetFileError,
  ContainsMetadataError,
]

export function detectErrorLevel(exception: any): SeverityLevel {
  if (WarnErrorClasses.some((ErrorClass) => exception instanceof ErrorClass)) {
    return 'warning'
  }
  return 'error'
}
