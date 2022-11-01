<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "$lib/stores/i18n";
  import { stopBusy } from "$lib/stores/busy.store";
  import { addHotkey } from "$lib/services/neurons.services";
  import { createEventDispatcher } from "svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { toastsError } from "$lib/stores/toasts.store";
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";

  export let neuronId: NeuronId;

  let principal: Principal | undefined = undefined;
  const dispatcher = createEventDispatcher();

  const add = async () => {
    // Edge case: button is only enabled when principal is defined
    if (principal === undefined) {
      toastsError({
        labelKey: "error.principal_not_valid",
      });
      return;
    }
    startBusyNeuron({ initiator: "add-hotkey-neuron", neuronId });
    await addHotkey({ neuronId, principal: principal });
    stopBusy("add-hotkey-neuron");
    dispatcher("nnsClose");
  };
</script>

<Modal on:nnsClose testId="add-hotkey-neuron-modal">
  <svelte:fragment slot="title"
    >{$i18n.neuron_detail.add_hotkey_modal_title}</svelte:fragment
  >

  <AddPrincipal bind:principal on:nnsSelectPrincipal={add} on:nnsClose>
    <span slot="title">{$i18n.neuron_detail.enter_hotkey}</span>
    <span slot="button">{$i18n.core.confirm}</span>
  </AddPrincipal>
</Modal>
