import { MemoryLogger } from './memory-logger'
import { ClientLogHandler, LogLevel } from './types'

export const createTransformHandler = (logger: MemoryLogger): ClientLogHandler => {
  return (level: string, message?: Error | string | undefined) => {
    if (level.toLowerCase() === 'error') {
      logger.log(LogLevel.ERROR, message)
    } else {
      logger.log(LogLevel.INFO, message)
    }
  }
}
