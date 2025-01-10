<script lang="ts">
  import NeuronProposalsCard from "$lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import { makeDummyProposals } from "$lib/services/sns-neurons.services";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let loading = false;

  const makeProposals = async () => {
    const neuronId = $store.neuron?.id[0];
    const rootCanisterId = $store.selected?.rootCanisterId;
    if (neuronId === undefined || rootCanisterId === undefined) {
      return;
    }
    loading = true;
    await makeDummyProposals({ neuronId, rootCanisterId });
    loading = false;
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<NeuronProposalsCard on:click={makeProposals} {loading} />
