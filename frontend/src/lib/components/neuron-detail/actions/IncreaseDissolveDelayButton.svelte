<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { NeuronState } from "@dfinity/nns";
  import { getContext } from "svelte";

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );

  let isUnlocked: boolean;
  $: isUnlocked = $store.neuron?.state === NeuronState.Dissolved;
</script>

<button
  class="secondary"
  data-tid="increase-dissolve-delay-button-component"
  on:click={() =>
    openNnsNeuronModal({
      type: "increase-dissolve-delay",
      data: { neuron: $store.neuron },
    })}
  >{isUnlocked
    ? $i18n.neurons.set_dissolve_delay
    : $i18n.neuron_detail.increase_dissolve_delay}</button
>
