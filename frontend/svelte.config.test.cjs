/**
 * Transpile tests from TypeScript to JavaScript.
 * The svelte-preprocess being used to bundle the app, we can also use it here compile the tests.
 */
const preprocess = require("svelte-preprocess");
module.exports = { preprocess: preprocess() };
