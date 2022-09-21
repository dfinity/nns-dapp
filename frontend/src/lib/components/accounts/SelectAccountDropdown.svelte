<script lang="ts">
  import { accountsStore } from "../../stores/accounts.store";
  import { accountsListStore } from "../../derived/accounts-list.derived";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { getAccountFromStore } from "../../utils/accounts.utils";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";

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
    fullWidth
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
