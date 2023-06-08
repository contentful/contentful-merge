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

### Just run the integration tests
```bash
npm test:integration
```
