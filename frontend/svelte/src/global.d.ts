/// <reference types="svelte" />

// The type declaration of the input event is neither defined in node types nor in svelte.
// This extends the event with the currentTarget that is provided by the browser and that can be used to retrieve the input value.
type InputEventHandler = Event & {
  currentTarget: EventTarget & HTMLInputElement;
};

// Solves following lint warning:
//
// Hint: Could not find a declaration file for module '@dfinity/.../dist/esm/...'. '...js' implicitly has an 'any' type.
// If the '@dfinity/...' package actually exposes this module, try adding a new declaration (.d.ts) file containing `declare module '@dfinity/.../dist/esm/...';`
declare module "@dfinity/nns/dist/esm/sns_wasm.canister';
declare module '@dfinity/sns/dist/esm/sns';
