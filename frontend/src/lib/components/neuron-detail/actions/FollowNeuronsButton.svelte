<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { getContext } from "svelte";

  export let buttonStyle: "primary" | "secondary" = "primary";

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  data-tid="follow-neurons-button-component"
  class={buttonStyle}
  on:click={() =>
    openNnsNeuronModal({ type: "follow", data: { neuron: $store.neuron } })}
  >{$i18n.neuron_detail.follow_neurons}</button
>
