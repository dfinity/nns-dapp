<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import DisburseNnsNeuronModal from "../../../modals/neurons/DisburseNnsNeuronModal.svelte";

  export let neuron: NeuronInfo | SnsNeuron;
  export let modal: typeof SvelteComponent;
  export let reloadContext:
    | ((params: { forceFetch: boolean }) => Promise<void>)
    | undefined = undefined;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="warning" on:click={openModal} data-tid="disburse-button"
  >{$i18n.neuron_detail.disburse}</button
>

{#if showModal}
  <DisburseNnsNeuronModal {neuron} on:nnsClose={closeModal} />
{/if}
