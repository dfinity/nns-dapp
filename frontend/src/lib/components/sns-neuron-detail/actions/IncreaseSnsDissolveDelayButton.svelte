<script lang="ts">
  import IncreaseSnsDissolveDelayModal from "$lib/modals/sns/IncreaseSnsDissolveDelayModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsNeuron } from "@dfinity/sns";
  import type { Token } from "@dfinity/nns";

  export let neuron: SnsNeuron;
  export let token: Token;
  export let reloadNeuron: () => Promise<void>;

  let showModal = false;
  const openModal = () => (showModal = true);
  const closeModal = () => (showModal = false);
</script>

<button
  class="primary"
  data-tid="sns-increase-dissolve-delay"
  on:click={openModal}>{$i18n.neuron_detail.increase_dissolve_delay}</button
>

{#if showModal}
  <IncreaseSnsDissolveDelayModal
    {neuron}
    {token}
    {reloadNeuron}
    on:nnsClose={closeModal}
  />
{/if}
