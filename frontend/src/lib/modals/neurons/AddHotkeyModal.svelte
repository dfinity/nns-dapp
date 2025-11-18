<script lang="ts">
  import AddPrincipal from "$lib/components/common/AddPrincipal.svelte";
  import { startBusyNeuron } from "$lib/services/busy.services";
  import { addHotkey } from "$lib/services/neurons.services";
  import { stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Modal } from "@dfinity/gix-components";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import type { Principal } from "@icp-sdk/core/principal";
  import { createEventDispatcher } from "svelte";

  export let neuron: NeuronInfo;

  let neuronId: NeuronId;
  $: ({ neuronId } = neuron);

  let principal: Principal | undefined = undefined;

  const dispatcher = createEventDispatcher();

  const close = () => dispatcher("nnsClose");

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
    close();
  };
</script>

<Modal onClose={close} testId="add-hotkey-neuron-modal">
  {#snippet title()}{$i18n.neuron_detail.add_hotkey_modal_title}{/snippet}

  <AddPrincipal bind:principal on:nnsSelectPrincipal={add} on:nnsClose>
    <span slot="title">{$i18n.neuron_detail.enter_hotkey}</span>
    <span slot="button">{$i18n.core.confirm}</span>
  </AddPrincipal>
</Modal>
