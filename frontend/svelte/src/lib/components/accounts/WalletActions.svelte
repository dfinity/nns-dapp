<script lang="ts">
  import type { Account, AccountType } from "../../types/account";
  import RenameSubAccountButton from "./RenameSubAccountButton.svelte";
  import HardwareWalletShowActionButton from "./HardwareWalletShowActionButton.svelte";
  import HardwareWalletListNeuronsButton from "./HardwareWalletListNeuronsButton.svelte";

  export let selectedAccount: Account | undefined;

  let type: AccountType | undefined;
  $: type = selectedAccount?.type;
</script>

<div role="menubar">
  {#if type === "subAccount"}
    <RenameSubAccountButton {selectedAccount} />
  {/if}

  {#if type === "hardwareWallet"}
    <HardwareWalletListNeuronsButton />
    <HardwareWalletShowActionButton />
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;

    > :global(*:not(:last-of-type)) {
      margin-right: var(--padding);
    }
  }
</style>
