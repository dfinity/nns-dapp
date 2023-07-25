// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}

/* eslint-disable */

declare namespace svelteHTML {
  // Svelte needs help to support typing of custom events.
  // Source: https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
  // We use `<any>` because we cannot import the types we use in the dapps that needs to be explicitely imported in the components - i.e. we cannot use .d.ts for these types.
  interface HTMLAttributes<T> {
    "on:nnsIntersecting"?: CompositionEventHandler<T>;
    "on:nnsCanisterDetailModal"?: CompositionEventHandler<T>;
    "on:nnsNeuronDetailModal"?: CompositionEventHandler<T>;
    "on:snsNeuronDetailModal"?: CompositionEventHandler<T>;
    "on:nnsWalletModal"?: CompositionEventHandler<T>;
    "on:nnsCkBTCAccountsModal"?: CompositionEventHandler<T>;
    "on:nnsAccountsModal"?: CompositionEventHandler<T>;
  }
}

/* eslint-enable */

// Solves following lint warning:
//
// Hint: Could not find a declaration file for module '@dfinity/.../dist/esm/...'. '...js' implicitly has an 'any' type.
// If the '@dfinity/...' package actually exposes this module, try adding a new declaration (.d.ts) file containing `declare module '@dfinity/.../dist/esm/...';`
declare module "@dfinity/nns/dist/esm/sns_wasm.canister";
declare module "@dfinity/sns/dist/esm/sns";
