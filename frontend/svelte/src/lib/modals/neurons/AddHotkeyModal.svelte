<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { Principal } from "@dfinity/principal";
  import type { NeuronId } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { busy, stopBusy } from "../../stores/busy.store";
  import { addHotkey } from "../../services/neurons.services";
  import { createEventDispatcher } from "svelte";
  import { startBusyNeuron } from "../../services/busy.services";
  import PrincipalInput from "../../components/ui/PrincipalInput.svelte";
  import { toastsStore } from "../../stores/toasts.store";

  export let neuronId: NeuronId;

  let validPrincipal: Principal | undefined = undefined;
  const dispatcher = createEventDispatcher();

  const add = async () => {
    // Edge case: button is only enabled when validPrincipal is defined
    if (validPrincipal === undefined) {
      toastsStore.error({
        labelKey: "error.principal_not_valid",
      });
      return;
    }
    startBusyNeuron({ initiator: "add-hotkey-neuron", neuronId });
    await addHotkey({ neuronId, principal: validPrincipal });
    stopBusy("add-hotkey-neuron");
    dispatcher("nnsClose");
  };
</script>

<Modal on:nnsClose theme="dark" size="big">
  <span slot="title">{$i18n.neuron_detail.add_hotkey_modal_title}</span>
  <form on:submit|preventDefault={add} data-tid="add-hotkey-neuron-modal">
    <div class="input-wrapper">
      <h5>{$i18n.neuron_detail.enter_hotkey}</h5>
      <PrincipalInput
        bind:validPrincipal
        placeholderLabelKey="neuron_detail.add_hotkey_placeholder"
        name="hotkey-principal"
      />
    </div>

    <button
      data-tid="add-hotkey-neuron-button"
      class="primary full-width"
      type="submit"
      disabled={validPrincipal === undefined || $busy}
    >
      {$i18n.core.confirm}
    </button>
  </form>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  h5 {
    text-align: center;
  }

  form {
    @include modal.section;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .input-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
