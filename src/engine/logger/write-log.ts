import fs from 'node:fs/promises'
import path from 'node:path'
import { MemoryLogger } from './memory-logger'

export const writeLog = async (logger: MemoryLogger): Promise<string> => {
  const logName = path.join(process.cwd(), `log-${logger.getType()}-${Date.now()}.log`)
  await fs.writeFile(logName, logger.toString())
  return logName
}
