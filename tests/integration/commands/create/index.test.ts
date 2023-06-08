// import { createClient } from 'contentful-management'
// import * as testUtils from '@contentful/integration-test-utils'
import {expect, test} from '@oclif/test'

// const client = createClient({

//   // This is the access token for this space. Normally you get the token in the Contentful web app
//   accessToken: 'omited-for-now',
// });

// const organizationId = 'omited-for-now';

// (async () => {
//   // returns an empty space with space '%JS CMA Entry API';
//   const testSpace = await testUtils.createTestSpace({
//     client,
//     organizationId,
//     repo: 'CMA',
//     language: 'JS',
//     testSuiteName: 'Adrian\'s test',
//   });

//   const testEnvironment = await testUtils.createTestEnvironment(testSpace, 'some-test-env-name');

//   testUtils.cleanUpTestSpaces({});
// })();
// ➜  ccccli git:(main) ✗ ./bin/dev create --space "ghk9wpnx0smm" --source "master" --target "masterclone" --cmaToken "CFPAT-3wzDbd27BNYmRhCEFDrRtm_mOA5QQkKYTLn0jhGFDdA" --cdaToken "BDOgbJ484BSMYqcYmw7-qovWRo0K84u4NwvwwyoLfYQ"

const space = 'omiomited-for-nowted'
const source = 'master'
const target = 'masterclone'
const cmaToken = 'omited-for-now'
const cdaToken = 'omited-for-now'

describe('create - happy path', () => {
  test
  .stdout()
  .command([
    'create',
    '--space',
    space,
    '--source',
    source,
    '--target',
    target,
    '--cmaToken',
    cmaToken,
    '--cdaToken',
    cdaToken,
  ])
  .it('should create a changeset when environments differ', ctx => {
    expect(ctx.stdout).to.contain('Changeset successfully created 🎉')
  })
  // it('should not create a changeset when environments are the same')
})

// describe('create - unhappy path', () => {
//   it('should error when invalid arguments provided'); // space, source, target, cmaToken, cdaToken
//   it('should error with 404 message when environment empty (or key has no access)');
// });
