import { AppPath } from "$lib/constants/routes.constants";
import { i18n } from "$lib/stores/i18n";
import { isSelectedPath } from "$lib/utils/navigation.utils";
import { derived } from "svelte/store";
import { pageStore } from "./page.derived";

export const titleTokenSelectorStore = derived(
  [i18n, pageStore],
  ([$i18n, page]) =>
    isSelectedPath({
      currentPath: page.path,
      paths: [AppPath.Accounts, AppPath.Wallet],
    })
      ? $i18n.universe.select_token
      : $i18n.universe.select_nervous_system
);
