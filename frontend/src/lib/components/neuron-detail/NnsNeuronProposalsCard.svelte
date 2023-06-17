<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { makeDummyProposals } from "$lib/services/neurons.services";
  import NeuronProposalsCard from "./NeuronProposalsCard.svelte";

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
