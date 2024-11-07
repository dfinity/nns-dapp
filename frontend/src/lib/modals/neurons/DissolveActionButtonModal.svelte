<script lang="ts">
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import {
    startDissolving,
    stopDissolving,
  } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { NeuronState, type NeuronId, type NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  let neuronId: NeuronId;
  $: ({ neuronId } = neuron);

  let isDissolving: boolean;
  $: isDissolving = neuron.state === NeuronState.Dissolving;

  let description: string;
  $: description = isDissolving
    ? $i18n.neuron_detail.stop_dissolve_description
    : $i18n.neuron_detail.start_dissolve_description;

  const dispatch = createEventDispatcher();

  const dissolveAction = async () => {
    const action = isDissolving ? stopDissolving : startDissolving;
    startBusyNeuron({ initiator: "dissolve-action", neuronId });
    await action(neuronId);
    dispatch("nnsClose");
    stopBusy("dissolve-action");
  };
</script>

<ConfirmationModal
  testId="dissolve-action-button-modal-component"
  on:nnsClose
  on:nnsConfirm={dissolveAction}
>
  <div data-tid="dissolve-action-modal">
    <h4>{$i18n.core.confirm}</h4>
    <p>{description}</p>
  </div>
</ConfirmationModal>


<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  div {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
