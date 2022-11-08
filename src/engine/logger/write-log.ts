import fs from 'node:fs/promises'
import {MemoryLogger} from './memory-logger'

export const writeLog = async (logger: MemoryLogger): Promise<void> => {
  const logName = `changeset-${logger.getType()}-log-${new Date().toISOString()}.log`
  await fs.writeFile(logName, logger.toString())
}
