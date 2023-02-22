<script lang="ts">
  import type { NeuronId } from "@dfinity/nns";
  import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";

  export let neuronId: NeuronId;
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <EditFollowNeurons {neuronId} />
</Modal>
