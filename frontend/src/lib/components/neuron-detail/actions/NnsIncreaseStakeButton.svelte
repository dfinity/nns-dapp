<script lang="ts">
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import IncreaseStakeButton from "./IncreaseStakeButton.svelte";

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<IncreaseStakeButton
  on:increaseStake={() =>
    openNnsNeuronModal({
      type: "increase-stake",
      data: { neuron: $store.neuron },
    })}
/>
