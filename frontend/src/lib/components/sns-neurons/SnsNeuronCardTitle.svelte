<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    getSnsNeuronIdAsHexString,
    isUserHotkey,
  } from "$lib/utils/sns-neuron.utils";
  import type { SnsNeuron } from "@dfinity/sns";

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
  <!-- Forward on:nnsIntersecting to parent to update title on scroll -->
  <div
    use:onIntersection
    on:nnsIntersecting
    data-tid="neuron-id-container"
    class="hash"
  >
    <Hash
      id="neuron-id"
      {tagName}
      testId="neuron-id"
      text={neuronId}
      showCopy
    />
  </div>
  {#if isHotkey}
    <span>{$i18n.neurons.hotkey_control}</span>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .hash {
    @include fonts.standard(true);
  }
</style>
