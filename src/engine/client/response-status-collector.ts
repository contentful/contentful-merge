export class ResponseStatusCollector {
  private data: Map<string, any[]>

  constructor() {
    this.data = new Map<string, any[]>()
  }

  add(status: string, value: any) {
    if (!this.data.has(status)) {
      this.data.set(status, [])
    }

    this.data.get(status)?.push(value)
  }

  get codes() {
    return [...this.data.keys()]
  }

  get errorsLength() {
    // eslint-disable-next-line unicorn/no-array-reduce
    return [...this.data.keys()].reduce((previousValue:number, key:string) => {
      previousValue += this.data.get(key)?.length || 0
      return previousValue
    }, 0)
  }

  toString() {
    return JSON.stringify(Object.fromEntries(this.data), null, 2)
  }
}
