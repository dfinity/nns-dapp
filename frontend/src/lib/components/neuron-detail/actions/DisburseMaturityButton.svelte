<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import Tooltip from "$lib/components/ui/Tooltip.svelte";

  export let enoughMaturity: boolean;
  export let variant: "primary" | "secondary" = "primary";
</script>

{#if enoughMaturity}
  <button class={variant} on:click data-tid="disburse-maturity-button"
    >{$i18n.neuron_detail.disburse_maturity}</button
  >
{:else}
  <Tooltip
    id="stake-maturity-tooltip"
    text={$i18n.neuron_detail.disburse_maturity_disabled_tooltip}
  >
    <button disabled class={variant} data-tid="disburse-maturity-button"
      >{$i18n.neuron_detail.disburse_maturity}</button
    >
  </Tooltip>
{/if}
