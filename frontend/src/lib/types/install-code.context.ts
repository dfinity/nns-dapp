import type { Principal } from "@dfinity/principal";
import type { Writable } from "svelte/store";

export interface InstallCodeStore {
  source: "url" | "file";
  canisterId: Principal;
  file?: File;
  url?: string;
}

export interface InstallCodeContext {
  store: Writable<InstallCodeStore>;
  next: () => void;
  back: () => void;
  selectFile: () => void;
  resetFile: () => void;
}

export const INSTALL_CODE_CONTEXT_KEY = Symbol("install-code");
