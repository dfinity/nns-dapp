import { AppPath } from "$lib/constants/routes.constants";
import { writable } from "svelte/store";

type AccountsEntryPoint = AppPath.Portfolio | AppPath.Tokens;

const initTokensTableOrderStore = () => {
  const { subscribe, set } = writable<AccountsEntryPoint>(AppPath.Tokens);

  return {
    subscribe,
    set,
  };
};

export const accountsNavigationEntryPoint = initTokensTableOrderStore();
