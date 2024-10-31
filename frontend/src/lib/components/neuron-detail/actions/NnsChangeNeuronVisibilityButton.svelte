<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { openNnsNeuronModal } from "$lib/utils/modals.utils";
  import { isPublicNeuron } from "$lib/utils/neuron.utils";
  import type { NeuronInfo } from "@dfinity/nns";

  export let neuron: NeuronInfo;
  export let disabled: boolean = false;

  let isPublic: boolean;
  $: isPublic = isPublicNeuron(neuron);

  const openModal = () => {
    // In a real browser environment, disabled buttons don't trigger onClick events.
    // However, in our testing environment, these events are triggered even when elements are disabled.
    // This conditional check ensures consistent behavior across both environments.
    if (!disabled)
      openNnsNeuronModal({
        type: "change-neuron-visibility",
        data: { neuron },
      });
  };
</script>

<button
  class="secondary"
  data-tid="change-neuron-visibility-button"
  on:click={openModal}
  {disabled}
  >{isPublic
    ? $i18n.neuron_detail.make_neuron_private
    : $i18n.neuron_detail.make_neuron_public}
</button>

<style lang="scss">
  button {
    text-wrap: nowrap;
  }
</style>
