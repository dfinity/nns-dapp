<script lang="ts">
  import { Spinner, Toolbar } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { onDestroy, setContext } from "svelte/internal";
  import { writable, type Unsubscriber } from "svelte/store";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { routePathAccountIdentifier } from "$lib/utils/accounts.utils";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { debugSelectedAccountStore } from "$lib/stores/debug.store";
  import { routeStore } from "$lib/stores/route.store";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "$lib/types/selected-account.context";
  import Footer from "$lib/components/common/Footer.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { busy } from "$lib/stores/busy.store";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import SnsTransactionsList from "$lib/components/accounts/SnsTransactionsList.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(() => {
    if (!ENABLE_SNS_2) {
      routeStore.update({ path: AppPath.LegacyAccounts });
    }
  });

  let showNewTransactionModal = false;

  const unsubscribe: Unsubscriber = snsOnlyProjectStore.subscribe(
    async (selectedProjectCanisterId) => {
      if (selectedProjectCanisterId !== undefined) {
        // Reload accounts always.
        // Do not set to loading because we might use the account in the store.
        await syncSnsAccounts(selectedProjectCanisterId);
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
    {#if $selectedAccountStore.account !== undefined && $snsOnlyProjectStore !== undefined}
      <WalletSummary />
      <SnsTransactionsList
        rootCanisterId={$snsOnlyProjectStore}
        account={$selectedAccountStore.account}
      />
    {:else}
      <Spinner />
    {/if}
  </section>
</main>

<Footer>
  <Toolbar>
    <button
      class="primary"
      on:click={() => (showNewTransactionModal = true)}
      disabled={$selectedAccountStore.account === undefined || $busy}
      data-tid="open-new-sns-transaction"
      >{$i18n.accounts.new_transaction}</button
    >
  </Toolbar>
</Footer>

{#if showNewTransactionModal}
  <SnsTransactionModal
    on:nnsClose={() => (showNewTransactionModal = false)}
    selectedAccount={$selectedAccountStore.account}
  />
{/if}
