<script lang="ts">
  import type { Account, AccountType } from "../../types/account";
  import RenameSubAccount from "./RenameSubAccount.svelte";
  import HardwareWalletShowAction from "./HardwareWalletShowAction.svelte";

  export let selectedAccount: Account | undefined;

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
