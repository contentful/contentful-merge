import {
  ChangesetFileError,
  ContainsMetadataError,
  ContentModelDivergedError,
  LimitsExceededForApplyError,
  LimitsExceededForCreateError,
  LocaleMissingForApplyError,
  AuthorizationErrorForApply,
} from '../errors'
import { SeverityLevel } from '@sentry/types/types/severity'

const WarnErrorClasses = [
  LimitsExceededForCreateError,
  LimitsExceededForApplyError,
  LocaleMissingForApplyError,
  ContentModelDivergedError,
  ChangesetFileError,
  ContainsMetadataError,
  AuthorizationErrorForApply,
]

export function detectErrorLevel(exception: any): SeverityLevel {
  if (WarnErrorClasses.some((ErrorClass) => exception instanceof ErrorClass)) {
    return 'warning'
  }
  return 'error'
}
