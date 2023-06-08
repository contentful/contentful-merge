import { ClientLogHandler, ILogger, LogLevel } from './types'

export const createTransformHandler = (logger: ILogger): ClientLogHandler => {
  return (level: string, message?: Error | string | undefined) => {
    if (level.toLowerCase() === 'error') {
      logger.log(LogLevel.ERROR, message)
    } else {
      logger.log(LogLevel.INFO, message)
    }
  }
}
