<script lang="ts">
  import type { AccountType } from "$lib/types/account";
  import { getContext } from "svelte";
  import {
    SELECTED_ACCOUNT_CONTEXT_KEY,
    type SelectedAccountContext,
  } from "$lib/types/selected-account.context";
  import RenameSubAccountButton from "./RenameSubAccountButton.svelte";
  import HardwareWalletShowActionButton from "./HardwareWalletShowActionButton.svelte";
  import HardwareWalletListNeuronsButton from "./HardwareWalletListNeuronsButton.svelte";

  const { store } = getContext<SelectedAccountContext>(
    SELECTED_ACCOUNT_CONTEXT_KEY
  );

  let type: AccountType | undefined;
  $: type = $store.account?.type;

  let displayActions = false;
  $: displayActions = ["subAccount", "hardwareWallet"].includes(type);
</script>

{#if displayActions}
  <div role="menubar">
    {#if type === "subAccount"}
      <RenameSubAccountButton />
    {/if}

    {#if type === "hardwareWallet"}
      <HardwareWalletListNeuronsButton />
      <HardwareWalletShowActionButton />
    {/if}
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/section";

  div {
    @include section.actions;
  }
</style>
