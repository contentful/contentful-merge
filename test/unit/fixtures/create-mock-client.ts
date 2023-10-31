import { createClient } from '../../../src/engine/client'
import * as sinon from 'sinon'
import { EnvironmentIdFixture } from './environment-id-fixtures'
import { sourceEntriesFixtureOnlySys, targetEntriesFixtureOnlySys } from './entries'

type LocalClient = ReturnType<typeof createClient>

export const createMockClient = (): LocalClient => ({
  requestCounts: sinon.stub().returns(0),
  cma: {
    requestCounts: sinon.stub().returns(0),
    entries: {
      create: sinon.stub().resolves({}),
      delete: sinon.stub().resolves({}),
      get: sinon.stub().resolves({}),
      getMany: sinon.stub().resolves({}),
      publish: sinon.stub().resolves({}),
      unpublish: sinon.stub().resolves({}),
      update: sinon.stub().resolves({}),
    },
    locales: {
      getMany: sinon.stub().resolves({ items: [ { code: 'de' }] }),
    }
  },
  cda: {
    requestCounts: sinon.stub().returns(0),
    entries: {
      get: sinon.stub().resolves({}),
      getMany: sinon
        .stub()
        .withArgs({ environment: EnvironmentIdFixture.source })
        .resolves(sourceEntriesFixtureOnlySys)
        .withArgs({ environment: EnvironmentIdFixture.target })
        .resolves(targetEntriesFixtureOnlySys),
    },
    contentTypes: {
      getMany: sinon.stub().resolves({}),
    },
  },
})
