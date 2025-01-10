<script lang="ts">
  import NeuronProposalsCard from "$lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import { makeDummyProposals } from "$lib/services/neurons.services";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let loading = false;

  const makeProposals = async () => {
    loading = true;
    await makeDummyProposals(neuron.neuronId);
    loading = false;
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<NeuronProposalsCard on:click={makeProposals} {loading} />
