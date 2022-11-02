<script lang="ts">
  import { Spinner, Toolbar, busy } from "@dfinity/gix-components";
  import { onMount } from "svelte";
  import { onDestroy, setContext } from "svelte/internal";
  import { writable, type Unsubscriber } from "svelte/store";
  import WalletSummary from "$lib/components/accounts/WalletSummary.svelte";
  import { ENABLE_SNS_2 } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { snsProjectAccountsStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
  import { debugSelectedAccountStore } from "$lib/stores/debug.store";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
    type SelectedAccountStore,
  } from "$lib/types/selected-account.context";
  import Footer from "$lib/components/common/Footer.svelte";
  import { i18n } from "$lib/stores/i18n";
  import SnsTransactionModal from "$lib/modals/accounts/SnsTransactionModal.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { goto } from "$app/navigation";
  import { layoutBackStore } from "$lib/stores/layout.store";
  import { buildUrl } from "$lib/utils/navigation.utils";
  import SnsTransactionsList from "$lib/components/accounts/SnsTransactionsList.svelte";

  // TODO: Clean after enabling sns https://dfinity.atlassian.net/browse/GIX-1013
  onMount(async () => {
    if (!ENABLE_SNS_2) {
      await goto(AppPath.Accounts, { replaceState: true });
    }
  });

  const goBack = (): Promise<void> =>
    goto(buildUrl({ path: AppPath.Accounts, universe: $pageStore.universe }));

  layoutBackStore.set(goBack);

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

  export let accountIdentifier: string | undefined | null = undefined;

  $: {
    if (accountIdentifier !== undefined) {
      const selectedAccount = $snsProjectAccountsStore?.find(
        ({ identifier }) => identifier === accountIdentifier
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
