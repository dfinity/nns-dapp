<script lang="ts">
  import { Island, Spinner } from "@dfinity/gix-components";
  import Summary from "$lib/components/summary/Summary.svelte";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { writable } from "svelte/store";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
    type WalletStore,
  } from "$lib/types/wallet.context";
  import { debugSelectedAccountStore } from "$lib/derived/debug.derived";
  import { setContext } from "svelte/internal";
  import { findAccount } from "$lib/utils/accounts.utils";
  import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
  import { nonNullish } from "$lib/utils/utils";
  import { loadCkBTCAccounts } from "$lib/services/ckbtc-accounts.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";

  export let accountIdentifier: string | undefined | null = undefined;

  const selectedAccountStore = writable<WalletStore>({
    account: undefined,
    neurons: [],
  });

  debugSelectedAccountStore(selectedAccountStore);

  setContext<WalletContext>(WALLET_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  const goBack = (): Promise<void> => goto(AppPath.Accounts);

  const loadAccount = async (): Promise<{
    state: "loaded" | "not_found" | "unknown";
  }> => {
    selectedAccountStore.set({
      account: findAccount({
        identifier: accountIdentifier,
        accounts: $ckBTCAccountsStore.accounts,
      }),
      neurons: [],
    });

    // We found an account in store for the provided account identifier, all data are set
    if (nonNullish($selectedAccountStore.account)) {
      return { state: "loaded" };
    }

    // Accounts are loaded in store but no account identifier is matching
    if ($ckBTCAccountsStore.accounts.length > 0) {
      toastsError({
        labelKey: replacePlaceholders($i18n.error.account_not_found, {
          $account_identifier: accountIdentifier ?? "",
        }),
      });

      await goBack();
      return { state: "not_found" };
    }

    return { state: "unknown" };
  };

  let loaded = false;

  const loadData = async () => {
    const { state } = await loadAccount();

    // The account was loaded or was not found even though accounts are already loaded in store
    if (state !== "unknown") {
      loaded = true;
      return;
    }

    // Maybe the accounts were just not loaded yet in store, so we try to load the accounts in store
    await loadCkBTCAccounts({});

    // And finally try to set the account again
    await loadAccount();

    loaded = true;
  };

  $: accountIdentifier, (async () => await loadData())();
</script>

<Island>
  <main class="legacy" data-tid="ckbtc-wallet">
    <section>
      {#if loaded}
        <Summary />

        <WalletSummary />

        <Separator />
      {:else}
        <Spinner />
      {/if}
    </section>
  </main>
</Island>
