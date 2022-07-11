<script lang="ts">
  import { onDestroy } from "svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import { getAccountFromStore } from "../../utils/accounts.utils";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let skipHardwareWallets: boolean = false;

  let selectedAccountIdentifier: string;
  $: selectedAccount = getAccountFromStore({
    identifier: selectedAccountIdentifier,
    accountsStore: $accountsStore,
  });

  let selectableAccounts: Account[] = [];
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
