<script lang="ts">
  import { Spinner } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { onDestroy, setContext } from "svelte/internal";
  import { writable, type Unsubscriber } from "svelte/store";
  import WalletSummary from "../components/accounts/WalletSummary.svelte";
  import { ENABLE_SNS_2 } from "../constants/environment.constants";
  import { AppPath } from "../constants/routes.constants";
  import { snsOnlyProjectStore } from "../derived/selected-project.derived";
  import { snsProjectAccountsStore } from "../derived/sns/sns-project-accounts.derived";
  import { routePathAccountIdentifier } from "../services/accounts.services";
  import { loadSnsAccounts } from "../services/sns-accounts.services";
  import { debugSelectedAccountStore } from "../stores/debug.store";
  import { routeStore } from "../stores/route.store";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "../types/selected-account.context";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (!ENABLE_SNS_2) {
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
