<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
</script>

<button
  data-tid="confirm-following-action-button-component"
  class="secondary"
  on:click={() =>
    openNnsNeuronModal({
      type: "confirm-following",
      data: { neuron },
    })}>{$i18n.losing_rewards.confirm}</button
>
