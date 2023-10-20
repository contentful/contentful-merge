import chalk from 'chalk'
import wrapAnsi from 'wrap-ansi'
import { Warning } from '../types'

const inform = chalk.bold.yellow
const warn = chalk.bold.red

const info = inform('INFO:')
const warning = warn('WARN:')

export function renderWarnings(warnings: Warning[]) {
  let output = '\n'

  output += chalk.bold(`The changeset will be applied with the following constraints:\n`)
  output += '\n'

  // This makes sure that line breaks don't break words
  output += warnings.map((warning) => wrapAnsi(WARNINGS[warning], process.stdout.columns)).join('\n')

  output += '\n'

  return output
}

const WARNINGS: Record<Warning, string> = {
  IMMEDIATE_PUBLISH: `${info} The applied changes will be ${inform('published directly')}.`,
  MASTER_IS_TARGET: `${info} The changes will be applied to the ${inform('master environment')}.`,
  OLD_CREATION_DATE: `${warning} The changeset was ${warn(
    'created over 24 hours ago'
  )}. If the content in the target environment has been modified since then, this could lead to a merge failure.`,
  SPACES_DONT_MATCH: `${warning} The provided ${warn(
    'space does not match'
  )} the space in the changeset file. This inconsistency could lead to a merge failure.`,
  ENVIRONMENTS_DONT_MATCH: `${warning} The provided ${warn(
    'environment does not match'
  )} the target environment in the changeset file. This inconsistency could lead to a merge failure.`,
}
