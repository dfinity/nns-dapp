import { AppPath } from "$lib/constants/routes.constants";
import { writable } from "svelte/store";

type AccountsEntryPoint = AppPath.Portfolio | AppPath.Tokens;

const initAccountsNavigationEntryPoint = () => {
  const { subscribe, set } = writable<AccountsEntryPoint>(AppPath.Tokens);

  return {
    subscribe,
    set,
  };
};

export const accountsNavigationEntryPointStore =
  initAccountsNavigationEntryPoint();
