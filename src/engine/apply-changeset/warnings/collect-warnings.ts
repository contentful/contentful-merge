import type { Warning } from '../types'
import type { Changeset } from '../../types'

const DATE_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
const MASTER_ENV = 'master'

export function collectWarnings({
  changeset,
  environmentId,
}: {
  changeset: Changeset
  environmentId: string
}): Warning[] {
  const targetEnv = environmentId
  const targetEnvFromChangeset = changeset.sys.target.sys.id
  const createdAt = changeset.sys.createdAt

  return [
    ...staticWarnings(),
    ...checkApplyingToMaster(targetEnv),
    ...checkChangesetAge(createdAt),
    ...checkTargetsMatch(targetEnv, targetEnvFromChangeset),
  ]
}

function staticWarnings(): Warning[] {
  return ['IMMEDIATE_PUBLISH']
}

function checkApplyingToMaster(targetEnv: string): Warning[] {
  if (targetEnv === MASTER_ENV) return ['MASTER_IS_TARGET']
  return []
}

function checkChangesetAge(createdAt: string): Warning[] {
  if (Date.now() - parseInt(createdAt) > DATE_THRESHOLD) return ['OLD_CREATION_DATE']
  return []
}

function checkTargetsMatch(targetEnv: string, targetEnvFromChangeset: string): Warning[] {
  if (targetEnv !== targetEnvFromChangeset) return ['ENVIRONMENTS_DONT_MATCH']
  return []
}
