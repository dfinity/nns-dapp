<script lang="ts">
  import StakeItemAction from "$lib/components/neuron-detail/StakeItemAction.svelte";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { neuronStake } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<StakeItemAction
  universe={$nnsUniverseStore}
  token={ICPToken}
  neuronStake={neuronStake(neuron)}
  on:increaseStake={() =>
    openNnsNeuronModal({
      type: "increase-stake",
      data: { neuron: $store.neuron },
    })}
/>
