import type { Principal } from "@dfinity/principal";
import type { Writable } from "svelte/store";

export interface InstallCodeStore {
  canisterId: Principal;
  file?: File;
  hash?: string;
}

export interface InstallCodeContext {
  store: Writable<InstallCodeStore>;
  next: () => void;
  back: () => void;
  selectFile: () => void;
}

export const INSTALL_CODE_CONTEXT_KEY = Symbol("install-code");
