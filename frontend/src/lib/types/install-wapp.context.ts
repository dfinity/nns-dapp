import type { Principal } from "@dfinity/principal";
import type { Writable } from "svelte/store";

export interface InstallWAppStore {
  canisterId: Principal;
  file?: File;
  hash?: string;
}

export interface InstallWAppContext {
  store: Writable<InstallWAppStore>;
  next: () => void;
  back: () => void;
  selectFile: () => void;
}

export const INSTALL_WAPP_CONTEXT_KEY = Symbol("install-wapp");
