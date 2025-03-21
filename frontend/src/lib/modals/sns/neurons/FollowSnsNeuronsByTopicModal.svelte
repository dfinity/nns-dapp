<script lang="ts">
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();

  const close = () => dispatcher("nnsClose");
</script>

<Modal
  on:nnsClose
  testId="follow-sns-neurons-by-topic-modal"
  --modal-content-overflow-y="scroll"
>
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <p class="description">{$i18n.follow_neurons.description}</p>

  <Separator spacing="medium" />

  TBD

  <div class="toolbar">
    <button data-tid="close-button" class="secondary" on:click={close}>
      {$i18n.core.close}
    </button>
  </div>
</Modal>
