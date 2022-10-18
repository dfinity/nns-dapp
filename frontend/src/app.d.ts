/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}

// Solves following lint warning:
//
// Hint: Could not find a declaration file for module '@dfinity/.../dist/esm/...'. '...js' implicitly has an 'any' type.
// If the '@dfinity/...' package actually exposes this module, try adding a new declaration (.d.ts) file containing `declare module '@dfinity/.../dist/esm/...';`
declare module "@dfinity/nns/dist/esm/sns_wasm.canister";
declare module "@dfinity/sns/dist/esm/sns";
