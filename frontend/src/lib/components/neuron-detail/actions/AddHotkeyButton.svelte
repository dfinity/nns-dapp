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
  data-tid="add-hotkey-button"
  class="primary"
  on:click={() => openNnsNeuronModal({type: "add-hotkey", data: {neuron: $store.neuron}})}
  >{$i18n.neuron_detail.add_hotkey}</button
>
