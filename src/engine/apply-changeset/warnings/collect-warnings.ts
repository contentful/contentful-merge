import type { Warning } from '../types'
import type { Changeset } from '../../types'

const DATE_THRESHOLD = 24 * 60 * 60 * 1000 // 24 hours
const MASTER_ENV = 'master'

export function collectWarnings({
  changeset,
  environmentId,
  spaceId,
}: {
  changeset: Changeset
  environmentId: string
  spaceId: string
}): Warning[] {
  const targetEnv = environmentId
  const targetSpace = spaceId
  const targetEnvFromChangeset = changeset.sys.target.sys.id
  const targetSpaceFromChangeset = changeset.sys.space.sys.id
  const createdAt = changeset.sys.createdAt

  return [
    ...staticWarnings(),
    ...checkApplyingToMaster(targetEnv),
    ...checkChangesetAge(createdAt),
    ...checkTargetsMatch({ targetSpace, targetSpaceFromChangeset, targetEnv, targetEnvFromChangeset }),
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

// This check is combined as environment mismatch only matters if the space matches
function checkTargetsMatch({
  targetEnv,
  targetSpace,
  targetEnvFromChangeset,
  targetSpaceFromChangeset,
}: {
  targetEnv: string
  targetSpace: string
  targetEnvFromChangeset: string
  targetSpaceFromChangeset: string
}): Warning[] {
  if (targetSpace !== targetSpaceFromChangeset) return ['SPACES_DONT_MATCH']
  if (targetEnv !== targetEnvFromChangeset) return ['ENVIRONMENTS_DONT_MATCH']
  return []
}
