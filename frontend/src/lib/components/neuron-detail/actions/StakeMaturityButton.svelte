<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Tooltip } from "@dfinity/gix-components";

  export let enoughMaturity: boolean;
</script>

{#if enoughMaturity}
  <button class="secondary" on:click data-tid="stake-maturity-button"
    >{$i18n.neuron_detail.stake_maturity}</button
  >
{:else}
  <Tooltip
    id="stake-maturity-tooltip"
    text={$i18n.neuron_detail.stake_maturity_disabled_tooltip}
  >
    <button disabled class="secondary" data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}
