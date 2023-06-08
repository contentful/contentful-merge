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

export interface ILogger {
  log: (level: LogLevel, message?: string | Error | undefined) => void
  toString: () => string
  toJSONString: () => string
  toJSON: () => Array<LogEntry>
}
