<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AccountsStore, accountsStore } from "../lib/stores/accounts.store";
  import type { Account } from "../lib/types/account";
  import ICP from "../lib/components/ic/ICP.svelte";
  import AccountCard from "../lib/components/accounts/AccountCard.svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/Toolbar.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/accounts");
    }
  });

  let main: Account | undefined;

  const unsubscribe: Unsubscriber = accountsStore.subscribe(
    async (accounts: AccountsStore) => (main = accounts?.main)
  );

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-225
  const createNewTransaction = () => alert("New Transaction");
  // TODO: TBD https://dfinity.atlassian.net/browse/L2-224
  const addAccount = () => alert("Add Account");

  onDestroy(unsubscribe);
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <div class="title">
        <h1>{$i18n.accounts.title}</h1>

        {#if main}
          <ICP icp={main?.balance} />
        {/if}
      </div>

      {#if main}
        <AccountCard account={main}>{$i18n.accounts.main}</AccountCard>
      {:else}
        <Spinner />
      {/if}
    </section>

    <svelte:fragment slot="footer">
      {#if main}
        <Toolbar>
          <button class="primary" on:click={createNewTransaction}
            >{$i18n.accounts.new_transaction}</button
          >
          <button class="primary" on:click={addAccount}
            >{$i18n.accounts.add_account}</button
          >
        </Toolbar>
      {/if}
    </svelte:fragment>
  </Layout>
{/if}

<style lang="scss">
  .title {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    margin-bottom: calc(2 * var(--padding));

    --icp-font-size: var(--font-size-h1);

    @media (max-width: 768px) {
      display: block;
    }
  }
</style>
