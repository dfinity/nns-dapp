<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import type { SnsNeuron } from "@dfinity/sns";
  import DisburseNnsNeuronModal from "../../../modals/neurons/DisburseNnsNeuronModal.svelte";
  import DisburseSnsNeuronModal from "../../../modals/neurons/DisburseSnsNeuronModal.svelte";

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
  {#if nnsNeuron !== undefined}
    <DisburseNnsNeuronModal neuron={nnsNeuron} on:nnsClose={closeModal} />
  {:else if snsNeuron !== undefined}
    <DisburseSnsNeuronModal
      neuron={snsNeuron}
      {reloadContext}
      on:nnsClose={closeModal}
    />
  {/if}
{/if}
