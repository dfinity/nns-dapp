<script lang="ts">
  import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import type { NeuronId } from "@dfinity/nns";

  type Props = {
    neuronId: NeuronId;
    onClose: () => void;
  };
  const { neuronId, onClose }: Props = $props();
</script>

<Modal
  testId="follow-neurons-modal-component"
  on:nnsClose
  --modal-content-overflow-y="scroll"
>
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <EditFollowNeurons {neuronId} />
  <div class="toolbar">
    <button data-tid="close-button" class="secondary" onclick={onClose}>
      {$i18n.core.close}
    </button>
  </div>
</Modal>
