export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export type ClientLogHandler = (level: string, data?: Error | string) => void

export type LogEntry = {
  time: number
  msg?: Error | string
  level: LogLevel
}

export type LogMessage = string | Error | undefined

export interface ILogger {
  log: (level: LogLevel, message?: LogMessage) => void
  info: (message?: LogMessage) => void
  error: (message?: LogMessage) => void
  toString: () => string
  toJSONString: () => string
  toJSON: () => Array<LogEntry>
}
