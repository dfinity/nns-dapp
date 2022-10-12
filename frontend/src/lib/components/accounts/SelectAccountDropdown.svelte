<script lang="ts">
  import { nnsAccountsListStore } from "$lib/derived/accounts-list.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import {
    getAccountByRootCanister,
    getAccountsByRootCanister,
  } from "$lib/utils/accounts.utils";
  import Dropdown from "$lib/components/ui/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/DropdownItem.svelte";
  import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
  import type { Principal } from "@dfinity/principal";

  export let selectedAccount: Account | undefined = undefined;
  export let rootCanisterId: Principal;
  export let filterAccounts: (account: Account) => boolean = () => true;

  // In case the component is already initialized with a selectedAccount
  // To avoid cyclical dependencies, we don't update this if `selectedAccount` changes
  let selectedAccountIdentifier: string | undefined =
    selectedAccount?.identifier;
  $: selectedAccount = getAccountByRootCanister({
    identifier: selectedAccountIdentifier,
    rootCanisterId,
    nnsAccounts: $nnsAccountsListStore,
    snsAccounts: $snsAccountsStore,
  });

  $: selectableAccounts =
    getAccountsByRootCanister({
      rootCanisterId,
      nnsAccounts: $nnsAccountsListStore,
      snsAccounts: $snsAccountsStore,
    })?.filter(filterAccounts) ?? [];
</script>

{#if selectableAccounts.length === 0}
  <Dropdown
    name="account"
    disabled
    selectedValue="no-accounts"
    testId="select-account-dropdown"
  >
    <DropdownItem value="no-accounts">
      {$i18n.accounts.no_account_select}
    </DropdownItem>
  </Dropdown>
{:else}
  <Dropdown
    name="account"
    bind:selectedValue={selectedAccountIdentifier}
    testId="select-account-dropdown"
  >
    {#each selectableAccounts as { identifier, name } (identifier)}
      <DropdownItem value={identifier}>
        {name ?? $i18n.accounts.main}
      </DropdownItem>
    {/each}
  </Dropdown>
{/if}
