import { ListrTask } from 'listr2'
import { ApplyChangesetContext } from '../types'
import { LogLevel } from '../../logger/types'
import { AuthorizationErrorForApply } from '../../errors'

export const createValidateAccessTask = (): ListrTask => {
  return {
    title: 'Validating access',
    task: async (context: ApplyChangesetContext) => {
      const { client, environmentId, logger } = context
      logger.log(LogLevel.INFO, 'Start createValidateAccessTask')

      try {
        await client.cma.entries.getMany({ environment: environmentId, query: { limit: 1 } })
      } catch (error) {
        logger.log(LogLevel.ERROR, 'Access denied')
        throw new AuthorizationErrorForApply(context)
      }
    },
  }
}
