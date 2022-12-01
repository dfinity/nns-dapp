// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
  // interface Locals {}
  // interface PageData {}
  // interface Error {}
  // interface Platform {}
}

// eslint window checks for custom events
declare namespace svelte.JSX {
  // Svelte needs help to support typing of custom events.
  // Source: https://github.com/sveltejs/language-tools/blob/master/docs/preprocessors/typescript.md#im-using-an-attributeevent-on-a-dom-element-and-it-throws-a-type-error
  // We use `<any>` because we cannot import the types we use in the dapps that needs to be explicitely imported in the components - i.e. we cannot use .d.ts for these types.
  interface HTMLAttributes<T> {
    onnnsIntersecting?: (event: CustomEvent<any>) => void;
    onnnsCanisterDetailModal?: (event: CustomEvent<any>) => void;
    onnnsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    onsnsNeuronDetailModal?: (event: CustomEvent<any>) => void;
    onnnsWalletModal?: (event: CustomEvent<any>) => void;
  }
}

// Solves following lint warning:
//
// Hint: Could not find a declaration file for module '@dfinity/.../dist/esm/...'. '...js' implicitly has an 'any' type.
// If the '@dfinity/...' package actually exposes this module, try adding a new declaration (.d.ts) file containing `declare module '@dfinity/.../dist/esm/...';`
declare module "@dfinity/nns/dist/esm/sns_wasm.canister";
declare module "@dfinity/sns/dist/esm/sns";
