<script lang="ts">
  import Modal from "../Modal.svelte";
  import type { Principal } from "@dfinity/principal";
  import { i18n } from "../../stores/i18n";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { addHotkey } from "../../services/sns-neurons.services";
  import { createEventDispatcher, getContext } from "svelte";
  import { toastsStore } from "../../stores/toasts.store";
  import AddPrincipal from "../../components/common/AddPrincipal.svelte";
  import { selectedProjectStore } from "../../derived/projects/selected-project.store";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "../../types/sns-neuron-detail.context";

  const { reload, store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

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
    // Edge case: modal can't be shown when neuron is not defined
    const neuronId = $store.neuron?.id[0];
    if (neuronId === undefined) {
      return;
    }
    startBusy({ initiator: "add-sns-hotkey-neuron" });
    const { success } = await addHotkey({
      neuronId,
      hotkey: principal,
      rootCanisterId: $selectedProjectStore,
    });
    if (success) {
      await reload({ forceFetch: true });
    }
    stopBusy("add-sns-hotkey-neuron");
    if (success) {
      dispatcher("nnsClose");
    }
  };
</script>

<Modal on:nnsClose size="big">
  <span slot="title" data-tid="add-hotkey-neuron-modal"
    >{$i18n.neuron_detail.add_hotkey_modal_title}</span
  >
  <section>
    <AddPrincipal bind:principal on:nnsSelectPrincipal={add} on:nnsClose>
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
