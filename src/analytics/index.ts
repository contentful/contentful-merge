import { EventProperties } from '@segment/analytics-core/src/events/interfaces'
import { Analytics } from '@segment/analytics-node'
import crypto from 'crypto'
import * as Sentry from '@sentry/node'
import { ProfilingIntegration } from '@sentry/profiling-node'
import { config } from '../config'

export function initSentry() {
  Sentry.init({
    dsn: 'https://5bc27276ac684a56bab07632be10a455@o2239.ingest.sentry.io/4505312653410304',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [new ProfilingIntegration()],
    environment: config.environment,
  })
}

const writeKey = 'YiSkRXCjHUpIDIk9wfbWhoGEGpR99ZXE'
const userId = crypto.randomUUID()

const analytics = new Analytics({
  writeKey,
  disable: process.env.DISABLE_ANALYTICS ? process.env.DISABLE_ANALYTICS.toLowerCase() === 'true' : false,
})

export async function analyticsCloseAndFlush(timeout: number) {
  return analytics.closeAndFlush({ timeout })
}

type TrackEventProps = {
  event: string
  properties?: EventProperties
}

function trackEvent({ event, properties }: TrackEventProps) {
  analytics.track({
    userId,
    event,
    timestamp: new Date(),
    properties: {
      sequence_key: userId,
      ...properties,
    },
  })
}

type CreateCommandTrackingContext = {
  sequence_key: string
  space_key: string
  source_environment_key: string
  target_environment_key: string
}

type CreateCommandStarted = CreateCommandTrackingContext

export function trackCreateCommandStarted(properties: CreateCommandStarted) {
  trackEvent({
    event: 'changeset_creation_started',
    properties,
  })
}

type CreateCommandCompleted = {
  duration: number
  num_changeset_items: number
  num_added_items: number
  num_removed_items: number
  num_changed_items: number
  num_source_entries: number
  num_target_entries: number
} & CreateCommandTrackingContext

export function trackCreateCommandCompleted(properties: CreateCommandCompleted) {
  trackEvent({
    event: 'changeset_creation_completed',
    properties,
  })
}

type CreateCommandFailed = {
  error_name: string
  error_message: string
  error_details?: string
} & CreateCommandTrackingContext

export function trackCreateCommandFailed(properties: CreateCommandFailed) {
  trackEvent({
    event: 'changeset_creation_failed',
    properties,
  })
}

type ApplyCommandTrackingContext = {
  sequence_key: string
  space_key: string
  target_environment_key: string
}

type ApplyCommandStarted = ApplyCommandTrackingContext

export function trackApplyCommandStarted(properties: ApplyCommandStarted) {
  trackEvent({
    event: 'changeset_apply_started',
    properties,
  })
}

type ApplyCommandCompleted = {
  duration: number
  num_changeset_items: number
  num_added_items: number
  num_removed_items: number
  num_changed_items: number
} & ApplyCommandTrackingContext

export function trackApplyCommandCompleted(properties: ApplyCommandCompleted) {
  trackEvent({
    event: 'changeset_apply_completed',
    properties,
  })
}

type ApplyCommandFailed = {
  error_name: string
  error_message: string
  error_details?: string
} & ApplyCommandTrackingContext

export function trackApplyCommandFailed(properties: ApplyCommandFailed) {
  trackEvent({
    event: 'changeset_apply_failed',
    properties,
  })
}
