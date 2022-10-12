<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import EditFollowNeurons from "$lib/components/neurons/EditFollowNeurons.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";

  export let neuron: NeuronInfo;
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <EditFollowNeurons {neuron} />
</Modal>

