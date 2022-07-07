<script lang="ts">
  import { onDestroy } from "svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { getAccountFromStore } from "../../utils/accounts.utils";
  import Spinner from "../ui/Spinner.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let skipHardwareWallets: boolean = false;

  let selectedAccountIdentifier: string;
  $: selectedAccount = getAccountFromStore({
    identifier: selectedAccountIdentifier,
    accountsStore: $accountsStore,
  });

  let selectableAccounts: Account[] | undefined;
  const unsubscribe = accountsStore.subscribe(
    ({ main, subAccounts, hardwareWallets }) => {
      if (main !== undefined) {
        selectedAccountIdentifier =
          selectedAccountIdentifier ?? main.identifier;
        selectableAccounts = [
          main,
          ...(subAccounts ?? []),
          ...(skipHardwareWallets ? [] : hardwareWallets ?? []),
        ];
      }
    }
  );

  onDestroy(unsubscribe);
</script>

<!-- TODO: Implement https://dfinity.atlassian.net/browse/L2-800 -->
{#if selectableAccounts !== undefined}
  <select
    bind:value={selectedAccountIdentifier}
    name="account"
    data-tid="select-account-dropdown"
  >
    {#each selectableAccounts as account}
      <option value={account.identifier}>
        {account.name ?? $i18n.accounts.main_account}</option
      >
    {/each}
  </select>
{:else}
  <Spinner />
{/if}
