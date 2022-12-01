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
  class="primary"
  on:click={() => toggleModal("follow")}
  data-tid="sns-follow-neurons-button"
  >{$i18n.neuron_detail.follow_neurons}</button
>
