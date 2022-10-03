<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import ConfirmationModal from "../../../modals/ConfirmationModal.svelte";
  import { startBusy, stopBusy } from "../../../stores/busy.store";
  import { i18n } from "../../../stores/i18n";
  import type { SnsNeuronId } from "@dfinity/sns";
  import {
    startDissolving,
    stopDissolving,
  } from "../../../services/sns-neurons.services";
  import { Principal } from "@dfinity/principal";
  import { snsOnlyProjectStore } from "../../../derived/selected-project.derived";
  import { assertNonNullish } from "@dfinity/utils";

  export let neuronId: SnsNeuronId;
  export let neuronState: NeuronState;

  let isOpen: boolean = false;

  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let isDissolving: boolean;
  let buttonKey: string;
  let descriptionKey: string;
  $: {
    isDissolving = neuronState === NeuronState.Dissolving;
    buttonKey = isDissolving ? "stop_dissolving" : "start_dissolving";
    descriptionKey = isDissolving
      ? "stop_dissolve_description"
      : "start_dissolve_description";
  }

  const dissolveAction = async () => {
    const action = isDissolving ? stopDissolving : startDissolving;

    let rootCanisterId: Principal = $snsOnlyProjectStore as Principal;

    // TODO: display HW message (like startBusyNeuron())
    startBusy({ initiator: "dissolve-action" });

    await action({ rootCanisterId, neuronId });
    closeModal();
    stopBusy("dissolve-action");
  };
</script>

<button on:click={showModal} class="warning"
  >{$i18n.neuron_detail[buttonKey]}</button
>
{#if isOpen}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={dissolveAction}>
    <div data-tid="dissolve-action-modal">
      <h4>{$i18n.core.confirm}</h4>
      <p>{$i18n.neuron_detail[descriptionKey]}</p>
    </div>
  </ConfirmationModal>
{/if}

<style lang="scss">
  @use "../../../themes/mixins/confirmation-modal";

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
