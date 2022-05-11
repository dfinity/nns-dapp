<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_ACCOUNTS_ROUTE,
  } from "../lib/constants/routes.constants";
  import NewTransactionModal from "../lib/modals/accounts/NewTransactionModal.svelte";
  import {
    getAccountFromStore,
    routePathAccountIdentifier,
  } from "../lib/services/accounts.services";
  import type { Account } from "../lib/types/account";
  import { accountsStore } from "../lib/stores/accounts.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import HardwareWalletShowAction from "../lib/components/accounts/HardwareWalletShowAction.svelte";

  onMount(() => {
    if (!SHOW_ACCOUNTS_ROUTE) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Accounts,
    });

  let showNewTransactionModal = false;

  let accountIdentifier: string | undefined;
  $: accountIdentifier = routePathAccountIdentifier($routeStore.path);

  let mainAccount: Account | undefined;
  $: mainAccount = $accountsStore?.main;

  // TODO(L2-429): context and store for selectedAccount
  let selectedAccount: Account | undefined;
  $: accountIdentifier,
    $accountsStore,
    (() => (selectedAccount = getAccountFromStore(accountIdentifier)))();
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    {#if mainAccount}
      <section>
        <h1>TBD - TODO(L2-429)</h1>

        <HardwareWalletShowAction />
      </section>
    {:else}
      <Spinner />
    {/if}

    <svelte:fragment slot="footer">
      <Toolbar>
        <button
          class="primary"
          on:click={() => (showNewTransactionModal = true)}
          disabled={selectedAccount === undefined || !mainAccount}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showNewTransactionModal}
    <NewTransactionModal
      on:nnsClose={() => (showNewTransactionModal = false)}
      {selectedAccount}
    />
  {/if}
{/if}
