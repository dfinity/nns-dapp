<script lang="ts">
  import { Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { onDestroy, setContext } from "svelte/internal";
  import { writable, type Unsubscriber } from "svelte/store";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { routePathAccountIdentifier } from "$lib/services/accounts.services";
  import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
  import { debugSelectedAccountStore } from "$lib/stores/debug.store";
  import { routeStore } from "$lib/stores/route.store";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "$lib/types/selected-account.context";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (!ENABLE_SNS) {
      routeStore.update({ path: AppPath.LegacyAccounts });
    }
  });

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // Reload accounts always.
        // Do not set to loading because we might use the account in the store.
        await loadSnsAccounts(selectedProjectCanisterId);
      }
    }
  );

  onDestroy(unsubscribe);

  const selectedAccountStore = writable<SelectedAccountStore>({
    account: undefined,
  });

  // TODO: Add transactions to debug store https://dfinity.atlassian.net/browse/GIX-1043
  debugSelectedAccountStore(selectedAccountStore);

  setContext<SelectedAccountContext>(SELECTED_ACCOUNT_CONTEXT_KEY, {
    store: selectedAccountStore,
  });

  let routeAccountIdentifier:
    | { accountIdentifier: string | undefined }
    | undefined;
  $: routeAccountIdentifier = routePathAccountIdentifier($routeStore.path);

  $: {
    if (routeAccountIdentifier?.accountIdentifier !== undefined) {
      const selectedAccount = $snsProjectAccountsStore?.find(
        ({ identifier }) =>
          identifier === routeAccountIdentifier?.accountIdentifier
      );

      selectedAccountStore.update(() => ({
        account: selectedAccount,
      }));
    }
  }
</script>

<main class="legacy" data-tid="sns-wallet">
  <section>
    {#if $selectedAccountStore.account !== undefined}
      <WalletSummary />
    {:else}
      <Spinner />
    {/if}
  </section>
</main>
