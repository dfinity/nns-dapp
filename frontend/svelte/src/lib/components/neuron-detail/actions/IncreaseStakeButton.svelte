<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import IncreaseNeuronStakeModal from "../../../modals/neurons/IncreaseNeuronStakeModal.svelte";

  export let neuron: NeuronInfo;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="primary small" on:click={openModal}
  >{$i18n.neuron_detail.increase_stake}</button
>

{#if showModal}
  <IncreaseNeuronStakeModal {neuron} on:nnsClose={closeModal} />
{/if}
