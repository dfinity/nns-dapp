import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
import { snsAccountsStore } from "$lib/derived/sns/sns-accounts.derived";
import type { Account } from "$lib/types/account";
import { mainAccount } from "$lib/utils/accounts.utils";
import { derived, type Readable } from "svelte/store";

export const snsProjectMainAccountStore: Readable<Account | undefined> =
  derived(
    [snsAccountsStore, selectedUniverseIdStore],
    ([store, selectedSnsRootCanisterId]) => {
      const projectStore = store[selectedSnsRootCanisterId.toText()];
      return projectStore === undefined
        ? undefined
        : mainAccount(projectStore.accounts);
    }
  );
