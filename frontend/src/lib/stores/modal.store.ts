import { writable } from "svelte/store";

export type WalletModal = "rename" | "hw-list-neurons";

export const walletModal = writable<undefined | WalletModal>(undefined);
