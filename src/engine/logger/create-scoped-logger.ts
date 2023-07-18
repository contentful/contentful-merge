import { ILogger, LogLevel } from './types'

export function createScopedLogger(logger: ILogger, scope: string) {
  const scopeStr = `[${scope}]`
  return {
    ...logger,
    log: (level: LogLevel, message?: string | Error | undefined) => logger.log(level, `${scopeStr}\t${message}`),
    startScope: () => logger.log(LogLevel.INFO, `${scopeStr}\tSTART`),
    stopScope: () => logger.log(LogLevel.INFO, `${scopeStr}\tDONE`),
  }
}
