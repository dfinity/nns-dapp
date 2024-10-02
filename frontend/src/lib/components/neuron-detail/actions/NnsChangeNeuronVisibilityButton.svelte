<script lang="ts">
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { isPublicNeuron } from "$lib/utils/neuron.utils";
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;

  let isPublic: boolean;
  $: isPublic = isPublicNeuron(neuron);

  const openModal = () =>
    openNnsNeuronModal({
      type: "change-neuron-visibility",
      data: { neuron },
    });
</script>

<button
  class="secondary"
  data-tid="change-neuron-visibility-button"
  on:click={openModal}
  >{isPublic
    ? $i18n.neuron_detail.make_neuron_private
    : $i18n.neuron_detail.make_neuron_public}
</button>
