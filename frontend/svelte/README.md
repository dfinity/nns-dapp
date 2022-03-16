# NNS Dapp Frontend (Svelte)

This is the project that will substitute the current frontend dapp. It has the same features and UI, but it's built with a different technology stack.

- **Stack**: [Typescript](https://www.typescriptlang.org/), [Svelte](https://svelte.dev/), [Rollup](https://rollupjs.org/guide/en/) and [Jest](https://jestjs.io/).
- **Status**: This project is still under development.

We are working on moving a lot of the logic for interfacing with the Internet Computer's Network Nervous System to its own open source project: [NNS-JS](https://github.com/dfinity/nns-js).

All the interactions with the Internet Computer are done through NNS-JS or the official [Agent-JS](https://github.com/dfinity/agent-js) packages.

## Installation and local development

Clone the project in your computer and install the libraries:

```
npm ci
```

Run the local development server:

```
npm run dev
```

Visit `localhost:8080`.

### Dependencies

At the moment pure local development is not supported. A testnet deployed and working is needed.

The environment variables in `env.config.mjs` need to point to the working testnet.

Normally you don't need to review the variables, but these are a few that might need to be reviewed if a deployment to testnet is done with new configuration parameters:

- `IDENTITY_SERVICE_URL`: This is the Internet Identity url to register and login.
- `OWN_CANISTER_ID`: The canister id of the NNS Dapp.

## Testing

Every Pull Request needs unit tests.

After installing the project, yuo can run the test suite:

```
npm test
```

There is also a project to run e2e tests [here](../../e2e-tests/README.md).

## Style

This project uses [Prettier](https://prettier.io/) and [Eslint](https://eslint.org/) to ensure a consistent style.

There are a few helpful commands:

- `npm run format` automatically formats the code according to prettier. This runs also in the Github pipeline.
- `npm run check` runs typescript and eslint checks.
