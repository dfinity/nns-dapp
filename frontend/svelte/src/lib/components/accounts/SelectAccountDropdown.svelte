<script lang="ts">
  import { onDestroy } from "svelte";
  import { accountsStore } from "../../stores/accounts.store";
  import { i18n } from "../../stores/i18n";
  import type { Account } from "../../types/account";
  import type { SelectOption } from "../../types/common";
  import { getAccountFromStore } from "../../utils/accounts.utils";
  import Dropdown from "../ui/Dropdown.svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let skipHardwareWallets: boolean = false;

  let selectedAccountIdentifier: string;
  $: selectedAccount = getAccountFromStore({
    identifier: selectedAccountIdentifier,
    accountsStore: $accountsStore,
  });

  let selectableAccounts: SelectOption[] = [];
  const convertAccountToSelectOption = (account: Account): SelectOption => ({
    value: account.identifier,
    label: account.name ?? $i18n.accounts.main,
  });
  const unsubscribe = accountsStore.subscribe(
    ({ main, subAccounts, hardwareWallets }) => {
      if (main !== undefined) {
        selectedAccountIdentifier =
          selectedAccountIdentifier ?? main.identifier;
        selectableAccounts = [
          convertAccountToSelectOption(main),
          ...(subAccounts?.map(convertAccountToSelectOption) ?? []),
          ...(skipHardwareWallets
            ? []
            : hardwareWallets?.map(convertAccountToSelectOption) ?? []),
        ];
      }
    }
  );

  onDestroy(unsubscribe);
</script>

<Dropdown
  name="account"
  bind:value={selectedAccountIdentifier}
  testId="select-account-dropdown"
  options={selectableAccounts}
/>
