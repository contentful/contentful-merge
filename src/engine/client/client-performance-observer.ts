import { CDAClient, Client } from '../types'
import { OutputFormatter } from '../utils/output-formatter'

export class ClientPerformanceObserver {
  private updater: ReturnType<typeof setInterval> | undefined
  private startTime: DOMHighResTimeStamp
  private currentCmaCount = 0
  private currentCdaCount = 0
  private cmaPerformanceMessage = ''
  private cdaPerformanceMessage = ''
  private client: Client

  constructor(client: Client) {
    this.client = client
    this.startTime = performance.now()
  }

  stop() {
    clearInterval(this.updater)
  }

  public start(callback?: (payload: { cda: string; cma: string }) => void): void {
    this.startTime = performance.now()
    this.currentCmaCount = this.client.cma.requestCounts()
    this.currentCdaCount = this.client.cma.requestCounts()
    this.updater = setInterval(() => {
      const currentTime = performance.now()
      const duration = (currentTime - this.startTime) / 1000
      const cmaCallsLastSecond = (this.client.cma.requestCounts() - this.currentCmaCount).toFixed(1)
      const cdaCallsLastSecond = (this.client.cda.requestCounts() - this.currentCdaCount).toFixed(1)
      this.currentCmaCount = this.client.cma.requestCounts()
      this.currentCdaCount = this.client.cda.requestCounts()
      const cmaAverageCallsPerSecond = (this.client.cma.requestCounts() / duration).toFixed(1)
      const cdaAverageCallsPerSecond = (this.client.cda.requestCounts() / duration).toFixed(1)
      this.cmaPerformanceMessage = `average ${OutputFormatter.formatNumber(
        cmaAverageCallsPerSecond + '/s'
      )}, current ${OutputFormatter.formatNumber(cmaCallsLastSecond + '/s')}`
      this.cdaPerformanceMessage = `average ${OutputFormatter.formatNumber(
        cdaAverageCallsPerSecond + '/s'
      )}, current ${OutputFormatter.formatNumber(cdaCallsLastSecond + '/s')}`
      if (typeof callback === 'function') {
        callback({ cda: this.cdaPerformanceMessage, cma: this.cmaPerformanceMessage })
      }
    }, 1000)
  }
}

export class SingleClientPerformanceObserver {
  private updater: ReturnType<typeof setInterval> | undefined
  private startTime: DOMHighResTimeStamp
  private currentCount = 0
  private performanceMessage = ''
  private client: CDAClient

  constructor(client: CDAClient) {
    this.client = client
    this.startTime = performance.now()
  }

  stop() {
    clearInterval(this.updater)
  }

  public start(callback?: (payload: string) => void): void {
    this.startTime = performance.now()
    this.currentCount = this.client.requestCounts()
    this.updater = setInterval(() => {
      const currentTime = performance.now()
      const duration = (currentTime - this.startTime) / 1000
      const callsLastSecond = (this.client.requestCounts() - this.currentCount).toFixed(1)
      this.currentCount = this.client.requestCounts()
      const averageCallsPerSecond = (this.client.requestCounts() / duration).toFixed(1)
      this.performanceMessage = `average ${OutputFormatter.formatNumber(
        averageCallsPerSecond + '/s'
      )}, current ${OutputFormatter.formatNumber(callsLastSecond + '/s')}`
      if (typeof callback === 'function') {
        callback(this.performanceMessage)
      }
    }, 1000)
  }
}
