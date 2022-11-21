<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { SnsNeuron } from "@dfinity/sns";
  import FollowSnsNeuronsModal from "$lib/modals/sns/FollowSnsNeuronsModal.svelte";
  import type { Principal } from "@dfinity/principal";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button
  class="primary"
  on:click={openModal}
  data-tid="sns-follow-neurons-button"
  >{$i18n.neuron_detail.follow_neurons}</button
>

{#if showModal}
  <FollowSnsNeuronsModal on:nnsClose={closeModal} {neuron} {rootCanisterId} />
{/if}
