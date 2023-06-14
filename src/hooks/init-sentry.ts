import { Hook } from '@oclif/core'
import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'

const hook: Hook<'init'> = async function () {
  Sentry.init({
    dsn: 'https://5bc27276ac684a56bab07632be10a455@o2239.ingest.sentry.io/4505312653410304',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [new ProfilingIntegration()],
    // TODO:  we should default to development and set production during a production build
    environment: process.env.CI ? 'development' : 'production',
  })
}

export default hook
