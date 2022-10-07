<script lang="ts">
  import { accountsStore } from "$lib/stores/accounts.store";
  import { accountsListStore } from "$lib/derived/accounts-list.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { getAccountFromStore } from "$lib/utils/accounts.utils";
  import Dropdown from "$lib/components/ui/Dropdown.svelte";
  import DropdownItem from "$lib/components/ui/DropdownItem.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;

  // In case the component is already initialized with a selectedAccount
  // To avoid cyclical dependencies, we don't update this if `selectedAccount` changes
  let selectedAccountIdentifier: string | undefined =
    selectedAccount?.identifier;
  $: selectedAccount = getAccountFromStore({
    identifier: selectedAccountIdentifier,
    accountsStore: $accountsStore,
  });

  $: selectableAccounts = $accountsListStore.filter(filterAccounts);
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
