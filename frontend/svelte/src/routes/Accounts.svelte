<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { accountsStore } from "../lib/stores/accounts.store";
  import type { AccountsStore } from "../lib/stores/accounts.store";
  import ICPComponent from "../lib/components/ic/ICP.svelte";
  import AccountCard from "../lib/components/accounts/AccountCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import {
    AppPath,
    SHOW_ACCOUNTS_ROUTE,
  } from "../lib/constants/routes.constants";
  import AddAcountModal from "../lib/modals/accounts/AddAccountModal.svelte";
  import { ICP } from "@dfinity/nns";
  import { sumICPs } from "../lib/utils/icp.utils";
  import NewTransactionModal from "../lib/modals/accounts/NewTransactionModal.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (!SHOW_ACCOUNTS_ROUTE) {
      window.location.replace(AppPath.Accounts);
    }
  });

  let accounts: AccountsStore | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (storeData: AccountsStore) => (accounts = storeData)
  );

  const cardClick = (identifier: string) =>
    routeStore.navigate({ path: `${AppPath.Wallet}/${identifier}` });

  onDestroy(unsubscribe);

  let modal: "AddAccountModal" | "NewTransaction" | undefined = undefined;
  const openAddAccountModal = () => (modal = "AddAccountModal");
  const openNewTransaction = () => (modal = "NewTransaction");
  const closeModal = () => (modal = undefined);

  let totalBalance: ICP;
  const zeroICPs = ICP.fromE8s(BigInt(0));
  $: {
    totalBalance = sumICPs(
      accounts?.main?.balance || zeroICPs,
      ...(accounts?.subAccounts || []).map(({ balance }) => balance)
    );
  }
</script>

{#if SHOW_ACCOUNTS_ROUTE}
  <Layout>
    <section>
      <div class="title">
        <h1>{$i18n.accounts.title}</h1>

        {#if accounts?.main}
          <ICPComponent icp={totalBalance} />
        {/if}
      </div>

      {#if accounts?.main?.identifier}
        <AccountCard
          role="link"
          on:click={() => cardClick(accounts?.main?.identifier ?? "")}
          showCopy
          account={accounts?.main}>{$i18n.accounts.main}</AccountCard
        >
        {#each accounts.subAccounts || [] as subAccount}
          <AccountCard
            role="link"
            on:click={() => cardClick(subAccount.identifier)}
            showCopy
            account={subAccount}>{subAccount.name}</AccountCard
          >
        {/each}
      {:else}
        <Spinner />
      {/if}
    </section>

    <svelte:fragment slot="footer">
      {#if accounts}
        <Toolbar>
          <button class="primary" on:click={openNewTransaction}
            >{$i18n.accounts.new_transaction}</button
          >
          <button class="primary" on:click={openAddAccountModal}
            >{$i18n.accounts.add_account}</button
          >
        </Toolbar>
      {/if}
    </svelte:fragment>
    {#if modal === "AddAccountModal"}
      <AddAcountModal on:nnsClose={closeModal} />
    {/if}
    {#if modal === "NewTransaction"}
      <NewTransactionModal on:nnsClose={closeModal} canSelectAccount={true} />
    {/if}
  </Layout>
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media.scss";

  .title {
    display: block;
    width: 100%;

    margin-bottom: calc(2 * var(--padding));

    --icp-font-size: var(--font-size-h1);

    @include media.min-width(medium) {
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }
  }
</style>
