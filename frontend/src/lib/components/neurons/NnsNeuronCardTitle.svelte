<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { getNeuronTags, type NeuronTag } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";

  export let neuron: NeuronInfo;
  export let tagName: "p" | "h3" = "p";

  let neuronTags: NeuronTag[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
  });
</script>

<div class="title" data-tid="neuron-card-title">
  <svelte:element this={tagName} data-tid="neuron-id"
    >{neuron.neuronId}</svelte:element
  >

  {#each neuronTags as tag}
    <small class="label" data-tid="neuron-tag">{tag.text}</small>
  {/each}
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
