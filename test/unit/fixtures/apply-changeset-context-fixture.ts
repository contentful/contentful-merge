import { createChangeset } from '../../../src/engine/utils/create-changeset'
import { createStubInstance } from 'sinon'
import { MemoryLogger } from '../../../src/engine/logger/memory-logger'
import { EnvironmentIdFixture } from './environment-id-fixtures'
import { createMockClient } from './create-mock-client'
import { ApplyChangesetContext } from '../../../src/engine/apply-changeset/types'
import { ResponseStatusCollector } from '../../../src/engine/client/response-status-collector'

export const createApplyChangesetContext = (context?: Partial<ApplyChangesetContext>): ApplyChangesetContext => ({
  client: createMockClient(),
  accessToken: '<access-token>',
  changeset: createChangeset(EnvironmentIdFixture.source, EnvironmentIdFixture.target),
  spaceId: '<space-id>',
  environmentId: EnvironmentIdFixture.target,
  inputPath: '<input-path>',
  responseCollector: new ResponseStatusCollector(),
  limit: 1000,
  logger: createStubInstance(MemoryLogger),
  processedEntities: {
    entries: { added: [], deleted: [], updated: [] },
  },
  ...context,
})
