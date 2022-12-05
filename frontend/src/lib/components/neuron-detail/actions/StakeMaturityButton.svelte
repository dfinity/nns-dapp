<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  export let enoughMaturity: boolean;
</script>

{#if enoughMaturity}
  <button class="primary" on:click data-tid="stake-maturity-button"
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
      data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}
