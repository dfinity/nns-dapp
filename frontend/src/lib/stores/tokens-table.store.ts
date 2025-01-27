import type { TokensTableOrder } from "$lib/types/tokens-page";
import { writable } from "svelte/store";

const initialTokensTableOrder: TokensTableOrder = [
  {
    columnId: "balance",
  },
  {
    columnId: "title",
  },
];

const initTokensTableOrderStore = () => {
  const { subscribe, set } = writable<TokensTableOrder>(
    initialTokensTableOrder
  );

  return {
    subscribe,
    set,
  };
};

export const tokensTableOrderStore = initTokensTableOrderStore();
