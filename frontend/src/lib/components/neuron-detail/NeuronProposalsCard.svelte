<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { makeDummyProposals } from "$lib/services/neurons.services";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import { Spinner } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: NeuronInfo;

  let loading = false;

  const makeProposals = async () => {
    loading = true;
    await makeDummyProposals(neuron.neuronId);
    loading = false;
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<CardInfo>
  <h3 slot="start">Proposals</h3>

  <div>
    <button
      on:click={makeProposals}
      class={`primary ${loading ? "icon-only" : ""}`}
      disabled={loading}
    >
      {#if loading}
        <Spinner inline size="small" />
      {:else}
        Make Dummy Proposals
      {/if}
    </button>
  </div>
</CardInfo>

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
