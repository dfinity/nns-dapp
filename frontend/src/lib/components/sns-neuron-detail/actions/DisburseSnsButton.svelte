<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import {SELECTED_SNS_NEURON_CONTEXT_KEY, type SelectedSnsNeuronContext} from "$lib/types/sns-neuron-detail.context";
  import {getContext} from "svelte";

  const { toggleModal }: SelectedSnsNeuronContext =
          getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
</script>

<button class="secondary" on:click={() => toggleModal("disburse")} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

