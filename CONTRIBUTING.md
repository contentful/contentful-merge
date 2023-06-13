# Intro
The CLI uses [oclif](https://oclif.io/) to generate an executable under the `bin` directory, in turn executing the code within `src`.

# Running locally
## Initial setup
```bash
nvm use # optional, but ensures you're on a supported version of Node
npm install
```

## Run locally
```bash
./bin/dev help
```

## Testing
### Run all tests
```bash
npm test
```

### Run the integration tests
```bash
ORG_ID=<org_id> CMA_TOKEN=<cma_token> npm run test:integration
```
