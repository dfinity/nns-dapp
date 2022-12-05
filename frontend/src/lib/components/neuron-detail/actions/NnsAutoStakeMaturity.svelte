<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { hasAutoStakeMaturityOn } from "$lib/utils/neuron.utils";
  import { getContext } from "svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import AutoStakeMaturity from "$lib/components/neuron-detail/actions/AutoStakeMaturity.svelte";

  export let neuron: NeuronInfo;

  let hasAutoStakeOn: boolean;
  $: hasAutoStakeOn = hasAutoStakeMaturityOn(neuron);

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<AutoStakeMaturity
  bind:hasAutoStakeOn
  on:nnsChange={() =>
    openNnsNeuronModal({
      type: "auto-stake-maturity",
      data: { neuron: $store.neuron },
    })}
/>
