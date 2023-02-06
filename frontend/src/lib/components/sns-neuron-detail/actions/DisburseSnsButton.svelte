<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
</script>

<button
  class="secondary"
  on:click={() => openSnsNeuronModal({ type: "disburse" })}
  data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
>
