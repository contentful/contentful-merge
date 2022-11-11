export class ResponseStatusCollector {
  private data: Map<string, any[]>
  private count: number

  constructor() {
    this.data = new Map<string, any[]>()
    this.count = 0
  }

  add(status: string, value: any) {
    if (!this.data.has(status)) {
      this.data.set(status, [])
    }

    this.data.get(status)?.push(value)
    this.count++
  }

  get codes() {
    return [...this.data.keys()]
  }

  get errorsLength() {
    return this.count
  }

  toString() {
    return JSON.stringify(Object.fromEntries(this.data), null, 2)
  }
}
