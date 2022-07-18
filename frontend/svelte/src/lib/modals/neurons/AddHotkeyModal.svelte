<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { stopBusy } from "../../stores/busy.store";
  import { addHotkey } from "../../services/neurons.services";
  import { createEventDispatcher } from "svelte";
  import { startBusyNeuron } from "../../services/busy.services";
  import { toastsStore } from "../../stores/toasts.store";
  import AddPrincipal from "../../components/common/AddPrincipal.svelte";

  export let neuronId: NeuronId;

  let principal: Principal | undefined = undefined;
  const dispatcher = createEventDispatcher();

  const add = async () => {
    // Edge case: button is only enabled when principal is defined
    if (principal === undefined) {
      toastsStore.error({
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

<Modal on:nnsClose size="big">
  <span slot="title" data-tid="add-hotkey-neuron-modal"
    >{$i18n.neuron_detail.add_hotkey_modal_title}</span
  >
  <section>
    <AddPrincipal bind:principal on:nnsSelectPrincipal={add}>
      <span slot="title">{$i18n.neuron_detail.enter_hotkey}</span>
      <span slot="button">{$i18n.core.confirm}</span>
    </AddPrincipal>
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal";
  section {
    @include modal.section;
  }
</style>
