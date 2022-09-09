<script lang="ts">
  import { onDestroy } from "svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { getAccountFromStore } from "../../utils/accounts.utils";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let filterAccounts: (account: Account) => boolean = () => true;

  let selectedAccountIdentifier: string;
  $: selectedAccount = getAccountFromStore({
    identifier: selectedAccountIdentifier,
    accountsStore: $accountsStore,
  });

  let accounts: Account[] = [];
  $: selectableAccounts = accounts.filter(filterAccounts);
  const unsubscribe = accountsStore.subscribe(
    ({ main, subAccounts, hardwareWallets }) => {
      if (main !== undefined) {
        selectedAccountIdentifier =
          selectedAccountIdentifier ?? main.identifier;
        accounts = [main, ...(subAccounts ?? []), ...(hardwareWallets ?? [])];
      }
    }
  );

  $: {
    if (
      selectableAccounts.find(
        ({ identifier }) => identifier === selectedAccountIdentifier
      ) === undefined
    ) {
      selectedAccountIdentifier = selectableAccounts[0]?.identifier;
    }
  }

  onDestroy(unsubscribe);
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
