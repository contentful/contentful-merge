import { MemoryLogger } from './memory-logger'
import { ClientLogHandler } from './types'

export const createTransformHandler = (logger: MemoryLogger): ClientLogHandler => {
  return (level: string, message?: Error | string | undefined) => {
    if (level.toLowerCase() === 'error') {
      logger.error(message)
    } else {
      logger.info(message)
    }
  }
}
