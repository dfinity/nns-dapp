<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import type { NeuronInfo } from "@dfinity/nns";

  type Props = {
    neuron: NeuronInfo;
  };
  const { neuron }: Props = $props();
</script>

<button
  class="secondary"
  onclick={() => openNnsNeuronModal({ type: "disburse", data: { neuron } })}
  data-tid="disburse-button">{$i18n.neuron_detail.disburse}</button
>
