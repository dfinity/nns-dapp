<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { getNeuronTags, type NeuronTagData } from "$lib/utils/neuron.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
  import NeuronTag from "$lib/components/ui/NeuronTag.svelte";

  export let neuron: NeuronInfo;
  export let tagName: "p" | "h3" = "p";

  let neuronTags: NeuronTagData[];
  $: neuronTags = getNeuronTags({
    neuron,
    identity: $authStore.identity,
    accounts: $icpAccountsStore,
    i18n: $i18n,
  });
</script>

<div class="title" data-tid="neuron-card-title">
  <svelte:element this={tagName} data-tid="neuron-id"
    ><span class="neuron-id">
      <span>{neuron.neuronId}</span>
    </span></svelte:element
  >

  {#each neuronTags as tag}
    <NeuronTag {tag} />
  {/each}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .neuron-id {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--padding-0_5x);
  }

  .title {
    @include card.stacked-title;

    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
    column-gap: var(--padding-0_5x);
  }

  p {
    flex: 1 0 auto;
    margin: var(--padding-0_5x) 0;
    @include fonts.standard(true);
    word-break: break-word;
  }
</style>
