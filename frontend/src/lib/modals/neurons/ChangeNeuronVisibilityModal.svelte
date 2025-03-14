<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import ChangeBulkNeuronVisibilityForm from "$lib/modals/neurons/ChangeBulkNeuronVisibilityForm.svelte";
  import { changeNeuronVisibility } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { Modal } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";

  export let defaultSelectedNeuron: NeuronInfo | null = null;
  // makePublic is also passed to ChangeBulkNeuronVisibilityForm
  // to select the filter that is going to be applied to definedNeuronsStore
  export let makePublic: boolean;

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
        makePublic,
      });
      if (success) {
        toastsSuccess({
          labelKey: makePublic
            ? "neuron_detail.change_neuron_public_success"
            : "neuron_detail.change_neuron_private_success",
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
    {makePublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_public
      : $i18n.neuron_detail.change_neuron_make_neuron_private}
  </svelte:fragment>

  <h4>
    {makePublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_public_confirmation
      : $i18n.neuron_detail.change_neuron_make_neuron_private_confirmation}
  </h4>

  <p class="description">
    {makePublic
      ? $i18n.neuron_detail.change_neuron_make_neuron_public_description
      : $i18n.neuron_detail.change_neuron_make_neuron_private_description}
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
    {makePublic}
  />
</Modal>
