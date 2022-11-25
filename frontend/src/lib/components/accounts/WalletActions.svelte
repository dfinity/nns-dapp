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
</script>

<div role="menubar">
  {#if type === "subAccount"}
    <RenameSubAccountButton />
  {/if}

  {#if type === "hardwareWallet"}
    <HardwareWalletListNeuronsButton />
    <HardwareWalletShowActionButton />
  {/if}
</div>

<style lang="scss">
  @use "../../themes/mixins/section";

  div {
    @include section.actions;
  }
</style>
