# NNS Dapp Frontend (Svelte)

All the pages in the [NNS dapp](https://nns.ic0.app/) come from this project.

- **Stack**: [Typescript](https://www.typescriptlang.org/), [SvelteKit](https://kit.svelte.dev/) and [Jest](https://jestjs.io/).

We are moving a lot of the logic for interfacing with the Internet Computer's Network Nervous System to its own open-source project: [ic-js](https://github.com/dfinity/ic-js).

All the Internet computer interactions are done through ic-js or the official [agent-JS](https://github.com/dfinity/agent-js) packages.

## Installation and local development

Clone the project on your computer and install the libraries:

```bash
npm ci
```

Then proceed as displayed in the [HACKING.md](/HACKING.md) documentation.

## Testing

Every Pull Request needs unit tests.

After installing the project, you can run the test suite:

```
npm run test
```

There is also a project to run e2e tests [here](../e2e-tests/README.md).

## Style

This project uses [Prettier](https://prettier.io/) and [Eslint](https://eslint.org/) to ensure a consistent style.

There are a few helpful commands:

- `npm run format` automatically formats the code according to prettier. This command also runs in the Github pipeline.
- `npm run check` runs Typescript and Eslint checks.
