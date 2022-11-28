<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronInfo } from "@dfinity/nns";
  import StakeMaturityModal from "$lib/modals/neurons/StakeMaturityModal.svelte";
  import { hasEnoughMaturityToStake } from "$lib/utils/neuron.utils";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  export let neuron: NeuronInfo;

  let isOpen = false;
  const showModal = () => (isOpen = true);
  const closeModal = () => (isOpen = false);

  let enoughMaturity: boolean;
  $: enoughMaturity = hasEnoughMaturityToStake(neuron);
</script>

{#if enoughMaturity}
  <button class="primary" on:click={showModal} data-tid="stake-maturity-button"
    >{$i18n.neuron_detail.stake_maturity}</button
  >
{:else}
  <Tooltip
    id="stake-maturity-tooltip"
    text={$i18n.neuron_detail.stake_maturity_disabled_tooltip}
  >
    <button
      disabled
      class="primary"
      on:click={showModal}
      data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}

{#if isOpen}
  <StakeMaturityModal on:nnsClose={closeModal} {neuron} />
{/if}
