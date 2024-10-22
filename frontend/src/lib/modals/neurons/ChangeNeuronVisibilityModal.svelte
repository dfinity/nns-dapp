<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { changeNeuronVisibility } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import ChangeBulkNeuronVisibilityForm from "./ChangeBulkNeuronVisibilityForm.svelte";

  export let defaultSelectedNeuron: NeuronInfo | null = null;
  export let isPublic: boolean;

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const handleChangeVisibility = async (
    event: CustomEvent<{ selectedNeurons: NeuronInfo[] }>
  ) => {
    const { selectedNeurons } = event.detail;
    startBusy({
      initiator: "change-neuron-visibility",
      labelKey: "neuron_detail.change_neuron_visibility_loading",
    });

    try {
      const { success } = await changeNeuronVisibility({
        neurons: selectedNeurons,
        makePublic: !isPublic,
      });
      if (success) {
        toastsSuccess({
          labelKey: isPublic
            ? "neuron_detail.change_neuron_private_success"
            : "neuron_detail.change_neuron_public_success",
        });

        close();
      } else {
        throw new Error("Error changing neuron visibility");
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
    } finally {
      stopBusy("change-neuron-visibility");
    }
  };
</script>

<Modal on:nnsClose testId="change-neuron-visibility-modal">
  <svelte:fragment slot="title">
    {isPublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_private
      : $i18n.neuron_detail.change_neuron_make_neuron_public}
  </svelte:fragment>

  <h4>
    {isPublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_private_confirmation
      : $i18n.neuron_detail.change_neuron_make_neuron_public_confirmation}
  </h4>

  <p class="description">
    {isPublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_private_description
      : $i18n.neuron_detail.change_neuron_make_neuron_public_description}
    <a
      href="https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
      target="_blank"
      rel="noopener noreferrer"
    >
      {$i18n.neurons.learn_more}
    </a>
  </p>

  <Separator spacing="medium" />

  <ChangeBulkNeuronVisibilityForm
    on:nnsCancel={close}
    on:nnsSubmit={handleChangeVisibility}
    {defaultSelectedNeuron}
    {isPublic}
  />
</Modal>
