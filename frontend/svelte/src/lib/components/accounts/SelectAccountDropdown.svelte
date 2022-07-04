<script lang="ts">
  import { onDestroy } from "svelte";

  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import Spinner from "../ui/Spinner.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let skipHardwareWallets: boolean = false;

  let selectableAccounts: Account[] | undefined;
  const unsubscribe = accountsStore.subscribe((accounts) => {
    if (accounts.main !== undefined) {
      selectedAccount = accounts.main;
      selectableAccounts = [
        accounts.main,
        ...(accounts.subAccounts ?? []),
        ...(skipHardwareWallets ? [] : accounts.hardwareWallets ?? []),
      ];
    }
  });

  onDestroy(unsubscribe);
</script>

<!-- TODO: Implement https://dfinity.atlassian.net/browse/L2-800 -->
{#if selectableAccounts !== undefined}
  <select
    bind:value={selectedAccount}
    name="account"
    data-tid="select-account-dropdown"
  >
    {#each selectableAccounts as account}
      <option value={account}>
        {account.name ?? $i18n.accounts.main_account}</option
      >
    {/each}
  </select>
{:else}
  <Spinner />
{/if}
