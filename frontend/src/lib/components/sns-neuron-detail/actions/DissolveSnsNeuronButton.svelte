<script lang="ts">
  import { NeuronState } from "@dfinity/nns";
  import ConfirmationModal from "$lib/modals/ConfirmationModal.svelte";
  import { startBusy, stopBusy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsNeuronId } from "@dfinity/sns";
  import {
    startDissolving,
    stopDissolving,
  } from "$lib/services/sns-neurons.services";
  import type { Principal } from "@dfinity/principal";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { keyOf } from "$lib/utils/utils";

  export let neuronId: SnsNeuronId;
  export let neuronState: NeuronState;
  export let reloadContext: () => Promise<void>;

  let isOpen = false;

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

    startBusy({ initiator: "dissolve-action" });

    await action({ rootCanisterId, neuronId });

    await reloadContext();

    closeModal();
    stopBusy("dissolve-action");
  };
</script>

<button on:click={showModal} class="warning"
  >{keyOf({ obj: $i18n.neuron_detail, key: buttonKey })}</button
>
{#if isOpen}
  <ConfirmationModal on:nnsClose={closeModal} on:nnsConfirm={dissolveAction}>
    <div data-tid="dissolve-sns-neuron-modal">
      <h4>{$i18n.core.confirm}</h4>
      <p>{keyOf({ obj: $i18n.neuron_detail, key: descriptionKey })}</p>
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
