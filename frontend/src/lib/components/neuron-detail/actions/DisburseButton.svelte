<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";
  import {openNnsNeuronModal} from "$lib/utils/modals.utils";

  const { store }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  class="secondary"
  on:click={() => openNnsNeuronModal({type: "disburse", data: {neuron: $store.neuron}})}
  data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
>
