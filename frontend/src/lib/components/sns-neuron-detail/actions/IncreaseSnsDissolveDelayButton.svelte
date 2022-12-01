<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { getContext } from "svelte";
  import type { SelectedSnsNeuronContext } from "$lib/types/sns-neuron-detail.context";
  import { SELECTED_SNS_NEURON_CONTEXT_KEY } from "$lib/types/sns-neuron-detail.context";

  const { toggleModal }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);
</script>

<button
  class="primary"
  data-tid="sns-increase-dissolve-delay"
  on:click={() => toggleModal("increase-dissolve-delay")}
  >{$i18n.neuron_detail.increase_dissolve_delay}</button
>
