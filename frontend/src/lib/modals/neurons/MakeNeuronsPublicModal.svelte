<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import MakeNeuronsPublicForm from "./MakeNeuronsPublicForm.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { changeNeuronVisibility } from "$lib/services/neurons.services";

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
        makePublic: true,
      });
      if (success) {
        toastsSuccess({
          labelKey: "neuron_detail.change_neuron_public_success",
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

<Modal on:nnsClose testId="make-neurons-public-modal-component">
  <svelte:fragment slot="title">
    {$i18n.neuron_detail.change_neuron_make_neuron_public}
  </svelte:fragment>

  <h4>
    {$i18n.neuron_detail.change_neuron_make_neuron_public_confirmation}
  </h4>

  <p class="description">
    {$i18n.neuron_detail.change_neuron_make_neuron_public_description}
    <a
      href="https://internetcomputer.org/docs/current/developer-docs/daos/nns/concepts/neurons/neuron-management"
      target="_blank"
      rel="noopener noreferrer"
    >
      {$i18n.neurons.learn_more}
    </a>
  </p>

  <Separator spacing="medium" />

  <MakeNeuronsPublicForm
    on:nnsCancel={close}
    on:nnsSubmit={handleChangeVisibility}
  />
</Modal>
