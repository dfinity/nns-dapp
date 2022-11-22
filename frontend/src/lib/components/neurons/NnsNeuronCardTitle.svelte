<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import {
    hasJoinedCommunityFund,
    isHotKeyControllable,
  } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";

  export let neuron: NeuronInfo;

  let isCommunityFund: boolean;
  $: isCommunityFund = hasJoinedCommunityFund(neuron);

  let isHotKeyControl: boolean;
  $: isHotKeyControl = isHotKeyControllable({
    neuron,
    identity: $authStore.identity,
  });
</script>

<div class="lock" data-tid="neuron-card-title">
  <p data-tid="neuron-id">{neuron.neuronId}</p>

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
  }
</style>
