import type { Account } from "$lib/types/account";
import type { Writable } from "svelte/store";

export interface InstallWAppStore {
  account?: Account;
  amount?: number;
  file?: File;
}

export interface InstallWAppContext {
  store: Writable<InstallWAppStore>;
  next: () => void;
  back: () => void;
  selectFile: () => void;
}

export const INSTALL_WAPP_CONTEXT_KEY = Symbol("install-wapp");
