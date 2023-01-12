<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    hasJoinedCommunityFund,
    isHotKeyControllable,
  } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";

  export let neuron: NeuronInfo;
  export let tagName: "p" | "h3" = "p";

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let isHotKeyControl: boolean;
  $: isHotKeyControl = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
</script>

<div class="title" data-tid="neuron-card-title">
  <svelte:element this={tagName} data-tid="neuron-id"
    >{neuron.neuronId}</svelte:element
  >

  {#if isCommunityFund}
    <small class="label">{$i18n.neurons.community_fund}</small>
  {/if}
  {#if isHotKeyControl}
    <small class="label">{$i18n.neurons.hotkey_control}</small>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/fonts";

  .title {
    @include card.stacked-title;
    word-break: break-word;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    @include fonts.standard(true);
  }
</style>
