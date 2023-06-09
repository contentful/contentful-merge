// USAGE: ORG_ID=<org_id> CMA_TOKEN=<cma_token> CONTENTFUL_INTEGRATION_TEST_CMA_TOKEN=<cma_token> CDA_TOKEN=<cda_token> npm run test:integration
// TODO - CMA token specified twice due to enforced naming convention of '@contentful/integration-test-utils'

import { ClientAPI, Environment, createClient } from "contentful-management";
import * as testUtils from '@contentful/integration-test-utils'
import { expect, test } from "@oclif/test";

const organizationId = process.env.ORG_ID!;
if (!organizationId) {
  throw new Error("Please provide an `ORG_ID`");
}
const cmaToken = process.env.CMA_TOKEN!;
if (!cmaToken) {
  throw new Error("Please provide an `CMA_TOKEN`");
}
const cdaToken = process.env.CDA_TOKEN!;
if (!cdaToken) {
  throw new Error("Please provide an `CDA_TOKEN`");
}

const targetEnvId = "master";
let sourceEnvId = "";
let spaceId = "";

const setup = async (client: ClientAPI): Promise<Environment> => {
  const testSpace = await testUtils.createTestSpace({
    client,
    organizationId,
    repo: 'CLI',
    language: 'JS',
    testSuiteName: "CCCCLI Int Tests",
  });

  const testEnvironment = await testUtils.createTestEnvironment(
    testSpace,
    'whatever-it-gets-ignored-anyway'
    );

  // store generated ids
  spaceId = testSpace.sys.id;
  sourceEnvId = testEnvironment.sys.id;

  return testEnvironment;
}

describe("create - happy path", () => {
  before(async () => {
    const client = createClient({ accessToken: cmaToken });
    const testEnvironment = await setup(client);

    const contentType = await testEnvironment.createContentType({
      name: 'TestType',
      fields: [
        { id: 'title', name: 'Title', type: 'Text', required: true, localized: false },
        { id: 'description', name: 'Description', type: 'Text', required: true, localized: false }
      ]
    });

    await contentType.publish();

    const entry = await testEnvironment.createEntry(contentType.sys.id, {
      fields: {
        title: { 'en-US': 'Hello from CCCCLI' },
        description: { 'en-US': "Lovely weather isn't it?" }
      },
    });
    entry.publish();
  });

  after(async () => {
    await testUtils.cleanUpTestSpaces({
      threshold: 0,
      dryRun: false,
    })
  });
// TODO - something is hanging..
  test
    .stdout()
    .command([
      "create",
      "--space",
      spaceId,
      "--source",
      sourceEnvId,
      "--target",
      targetEnvId,
      "--cmaToken",
      cmaToken,
      "--cdaToken",
      cdaToken,
    ])
    .it("should create a changeset when environments differ", (ctx) => {
      expect(ctx.stdout).to.contain("Changeset successfully created 🎉");
    });
  // it('should not create a changeset when environments are the same')
});

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
