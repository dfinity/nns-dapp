<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";

  const { toggleModal }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
</script>

<button
  data-tid="add-hotkey-button"
  class="primary"
  on:click={() => toggleModal("add-hotkey")}
  >{$i18n.neuron_detail.add_hotkey}</button
>
