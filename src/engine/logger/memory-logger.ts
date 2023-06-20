import { ILogger, LogEntry, LogLevel } from './types'
import { CommandType } from '../types'

export class MemoryLogger implements ILogger {
  protected data: LogEntry[]

  constructor(protected type: CommandType) {
    this.data = []
  }

  public getType(): CommandType {
    return this.type
  }

  public log(level: LogLevel, msg?: Error | string | undefined): void {
    this.data.push({
      time: Date.now(),
      msg: msg,
      level,
    })
  }

  public toString(): string {
    return this.data
      .map((item) => `${new Date(item.time).toISOString()}\t${item.level.toUpperCase()}\t${item.msg}`)
      .join('\n')
  }

  public toJSONString(): string {
    return JSON.stringify(this.data, null, 2)
  }

  public toJSON(): Array<LogEntry> {
    return this.data
  }
}
