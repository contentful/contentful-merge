import { ListrTask } from 'listr2'

export const createCallbackTask = (callback: () => void): ListrTask => {
  return {
    task: () => {
      callback()
    },
  }
}
