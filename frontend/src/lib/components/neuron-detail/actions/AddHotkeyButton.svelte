<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    NNS_NEURON_CONTEXT_KEY,
    type NnsNeuronContext,
  } from "$lib/types/nns-neuron-detail.context";
  import { getContext } from "svelte";

  const { toggleModal }: NnsNeuronContext = getContext<NnsNeuronContext>(
    NNS_NEURON_CONTEXT_KEY
  );
</script>

<button
  data-tid="add-hotkey-button"
  class="primary"
  on:click={() => toggleModal("add-hotkey")}
  >{$i18n.neuron_detail.add_hotkey}</button
>
