<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    hasJoinedCommunityFund,
    isHotKeyControllable,
  } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { onIntersection } from "$lib/directives/intersection.directives";

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

<div class="lock" data-tid="neuron-card-title">
  <svelte:element this={tagName} data-tid="neuron-id" use:onIntersection on:nnsIntersecting
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

  .lock {
    @include card.stacked-title;
    word-break: break-word;
  }
</style>
