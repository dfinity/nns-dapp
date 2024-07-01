<script lang="ts">
  import StakeMaturityButton from "$lib/components/neuron-detail/actions/StakeMaturityButton.svelte";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { hasEnoughMaturityToStake } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let neuron: NeuronInfo;

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStake(neuron);

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  const showModal = () =>
    openNnsNeuronModal({
      type: "stake-maturity",
      data: { neuron: $store.neuron },
    });
</script>

<StakeMaturityButton {enoughMaturity} on:click={showModal} />
