<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";
  import MakeNeuronsPublicForm from "./MakeNeuronsPublicForm.svelte";

  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
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

  <MakeNeuronsPublicForm on:nnsCancel={close} />
</Modal>
