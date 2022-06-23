# NNS Dapp Frontend (Svelte)

All the pages in the [NNS dapp](https://nns.ic0.app/) come from this project.

- **Stack**: [Typescript](https://www.typescriptlang.org/), [Svelte](https://svelte.dev/), [Rollup](https://rollupjs.org/guide/en/), and [Jest](https://jestjs.io/).
- **Status**: This project is still under development.

We are moving a lot of the logic for interfacing with the Internet Computer's Network Nervous System to its own open-source project: [nns-js](https://github.com/dfinity/nns-js).

All the Internet computer interactions are done through nns-js or the official [agent-JS](https://github.com/dfinity/agent-js) packages.

## Status

The plan is to deploy the pages of this project one by one as soon they are ready.

- Log in page: Deployed.
- Proposals: Deployed.
- Neurons: Deployed.
- Accounts: Deployed.
- Canisters: In development.

Until all the pages come from this project, the NNS Dapp is a hybrid of the pages in the `dart` directory and the routes in this project.

## Installation and local development

Clone the project on your computer and install the libraries:

```bash
npm ci
```

Run the local development server:

```bash
npm run dev
```

Visit `localhost:8080`.

### Dependencies

At the moment, pure local development is not supported. A testnet deployed, and working is needed.

The environment variables in `env.config.mjs` need to point to the working testnet.

There is usually no need to review the variables, but there are a few that might need to be checked if the deployment to testnet is done with new configuration parameters:

- `IDENTITY_SERVICE_URL`: This is the Internet Identity URL to register and log in.
- `OWN_CANISTER_ID`: The canister id of the NNS Dapp.

## Testing

Every Pull Request needs unit tests.

After installing the project, you can run the test suite:

```
npm test
```

There is also a project to run e2e tests [here](../../e2e-tests/README.md).

## Style

This project uses [Prettier](https://prettier.io/) and [Eslint](https://eslint.org/) to ensure a consistent style.

There are a few helpful commands:

- `npm run format` automatically formats the code according to prettier. This command also runs in the Github pipeline.
- `npm run check` runs Typescript and Eslint checks.
