#!/bin/bash

npm rm @dfinity/gix-components @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte @testing-library/jest-dom @testing-library/svelte @testing-library/user-event @vitest/coverage-v8 svelte svelte-check svelte-preprocess svelte2tsx vite vitest vitest-mock-extended globals @types/node

npm i @sveltejs/adapter-static @sveltejs/kit @sveltejs/vite-plugin-svelte @testing-library/jest-dom @testing-library/svelte @testing-library/user-event @vitest/coverage-v8 svelte svelte-check svelte-preprocess vite vitest vitest-mock-extended globals @types/node -D

npm i dfinity-gix-components-5.1.0.tgz
