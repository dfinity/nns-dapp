<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    hasJoinedCommunityFund,
    isHotkeyFlag,
    isNeuronControlledByHardwareWallet,
  } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";

  export let neuron: NeuronInfo;
  export let tagName: "p" | "h3" = "p";

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let hotkeyFlag: boolean;
  $: hotkeyFlag = isHotkeyFlag({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
  });

  let isHWControlled: boolean;
  $: isHWControlled = isNeuronControlledByHardwareWallet({
    neuron,
    accounts: $icpAccountsStore,
  });
</script>

<div class="title" data-tid="neuron-card-title">
  <svelte:element this={tagName} data-tid="neuron-id"
    >{neuron.neuronId}</svelte:element
  >

  {#if isCommunityFund}
    <small class="label">{$i18n.neurons.community_fund}</small>
  {/if}
  {#if hotkeyFlag}
    <small class="label" data-tid="hotkey-tag"
      >{$i18n.neurons.hotkey_control}</small
    >
  {/if}
  {#if isHWControlled}
    <small class="label" data-tid="hardware-wallet-tag"
      >{$i18n.neurons.hardware_wallet_control}</small
    >
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .title {
    @include card.stacked-title;
    word-break: break-word;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    @include fonts.standard(true);
  }
</style>
