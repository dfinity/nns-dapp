<script lang="ts">
  import type { SnsNeuron } from "@dfinity/sns";
  import Hash from "$lib/components/ui/Hash.svelte";
  import {
    getSnsNeuronIdAsHexString,
    isUserHotkey,
  } from "$lib/utils/sns-neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { onIntersection } from "$lib/directives/intersection.directives";

  export let neuron: SnsNeuron;
  export let tagName: "h3" | "p" = "h3";

  let neuronId: string;
  $: neuronId = getSnsNeuronIdAsHexString(neuron);

  let isHotkey: boolean;
  $: isHotkey = isUserHotkey({
    neuron,
    identity: $authStore.identity,
  });
</script>

<div class="identifier" data-tid="sns-neuron-card-title">
  <div use:onIntersection on:nnsIntersecting data-tid="neuron-id-container">
    <Hash id="neuron-id" {tagName} testId="neuron-id" text={neuronId} />
  </div>
  {#if isHotkey}
    <span>{$i18n.neurons.hotkey_control}</span>
  {/if}
</div>

<style lang="scss">
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/media";
  @use "../../../../node_modules/@dfinity/gix-components/styles/mixins/card";

  .identifier {
    @include card.stacked-title;
    word-break: break-word;
  }
</style>
