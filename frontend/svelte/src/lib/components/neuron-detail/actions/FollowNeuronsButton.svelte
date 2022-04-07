<script lang="ts">
  import { i18n } from "../../../stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import FollowNeuronsModal from "../../../modals/neurons/FollowNeuronsModal.svelte";

  export let neuron: NeuronInfo;

  let showModal: boolean = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button class="primary small" on:click={openModal}
  >{$i18n.neuron_detail.follow_neurons}</button
>

{#if showModal}
  <FollowNeuronsModal on:nnsClose={closeModal} {neuron} />
{/if}
