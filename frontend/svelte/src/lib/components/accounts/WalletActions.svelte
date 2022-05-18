<script lang="ts">
  import type { AccountType } from "../../types/account";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "../../types/selected-account.context";
  import RenameSubAccountButton from "./RenameSubAccountButton.svelte";
  import HardwareWalletShowActionButton from "./HardwareWalletShowActionButton.svelte";
  import HardwareWalletListNeuronsButton from "./HardwareWalletListNeuronsButton.svelte";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let type: AccountType | undefined;
  $: type = $store.account?.type;
</script>

<div role="menubar">
  {#if type === "subAccount"}
    <RenameSubAccountButton selectedAccount={$store.account} />
  {/if}

  {#if type === "hardwareWallet"}
    <HardwareWalletListNeuronsButton selectedAccount={$store.account} />
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
