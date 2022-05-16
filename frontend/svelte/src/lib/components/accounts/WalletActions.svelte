<script lang="ts">
  import type { Account, AccountType } from "../../types/account";
  import RenameSubAccount from "./RenameSubAccount.svelte";
  import HardwareWalletShowAction from "./HardwareWalletShowAction.svelte";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../stores/selectedAccount.store";

  const selectedAccountStore = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );
  let selectedAccount: Account | undefined;
  $: selectedAccount = $selectedAccountStore.account;

  let type: AccountType | undefined;
  $: type = selectedAccount?.type;
</script>

<div role="menubar">
  {#if type === "subAccount"}
    <RenameSubAccount {selectedAccount} />
  {/if}

  {#if type === "hardwareWallet"}
    <HardwareWalletShowAction />
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
