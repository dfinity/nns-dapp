<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { keyOf } from "$lib/utils/utils";
  import { NeuronState } from "@dfinity/nns";
  import { getContext } from "svelte";

  export let neuronState: NeuronState;

  let isDissolving: boolean;
  let buttonKey: string;
  $: {
    isDissolving = neuronState === NeuronState.Dissolving;
    buttonKey = isDissolving ? "stop_dissolving" : "start_dissolving";
  }

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  class="secondary"
  data-tid="nns-dissolve-action-button"
  on:click={() =>
    openNnsNeuronModal({ type: "dissolve", data: { neuron: $store.neuron } })}
  >{keyOf({ obj: $i18n.neuron_detail, key: buttonKey })}</button
>
