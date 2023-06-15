import { EventProperties } from '@segment/analytics-core/src/events/interfaces'
import { Analytics } from '@segment/analytics-node'

// development write key
const writeKey = 'rVISKfhJoJ0asHt5rC7XcPFQpRS3Yo2g'
const userId = '<random>'

const analytics = new Analytics({
  writeKey,
  disable: !!process.env.DISABLE_ANALYTICS,
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

type Context = {
  sequence_key: string
  space_key: string
  source_environment_key: string
  target_environment_key: string
}

type CreateCommandStarted = Context
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
  num_changeset_items_exceeded: boolean
} & Context

export function trackCreateCommandCompleted(properties: CreateCommandCompleted) {
  trackEvent({
    event: 'changeset_creation_completed',
    properties,
  })
}
