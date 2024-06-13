import { createChangeset } from '../../../src/engine/utils/create-changeset'
import { createStubInstance } from 'sinon'
import { MemoryLogger } from '../../../src/engine/logger/memory-logger'
import { CreateChangesetContext } from '../../../src/engine/create-changeset/types'
import { EnvironmentIdFixture } from './environment-id-fixtures'
import { createMockClient } from './create-mock-client'

export const createCreateChangesetContext = (context?: Partial<CreateChangesetContext>): CreateChangesetContext => ({
  client: createMockClient(),
  accessToken: '<access-token>',
  changeset: createChangeset(EnvironmentIdFixture.source, EnvironmentIdFixture.target, 'some-space-id'),
  spaceId: '<space-id>',
  sourceEnvironmentId: EnvironmentIdFixture.source,
  targetEnvironmentId: EnvironmentIdFixture.target,
  statistics: {
    entries: { added: 0, removed: 0, changed: 0, nonChanged: 0 },
    contentTypes: { added: 0, removed: 0, changed: 0, nonChanged: 0 },
  },
  limit: 1000,
  requestBatchSize: 1000,
  logger: createStubInstance(MemoryLogger),
  sourceData: {
    contentTypes: { ids: [], comparables: [] },
    entries: {
      comparables: [],
      ids: [],
    },
  },
  targetData: {
    contentTypes: { ids: [], comparables: [] },
    entries: {
      comparables: [],
      ids: [],
    },
  },
  affectedEntities: {
    entries: { added: [], removed: [], maybeChanged: [], changed: [] },
    contentTypes: { added: [], removed: [], maybeChanged: [], changed: [] },
  },
  limits: {
    all: 100,
    added: 100,
    removed: 100,
    changed: 100,
  },
  allowedOperations: ['add', 'delete', 'update'],
  ...context,
})
