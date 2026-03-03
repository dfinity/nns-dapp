<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Tooltip } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";

  export let disabledText: string | undefined = undefined;
</script>

{#if isNullish(disabledText)}
  <button class="secondary" on:click data-tid="stake-maturity-button"
    >{$i18n.neuron_detail.stake_maturity}</button
  >
{:else}
  <Tooltip id="stake-maturity-tooltip" text={disabledText}>
    <button disabled class="secondary" data-tid="stake-maturity-button"
      >{$i18n.neuron_detail.stake_maturity}</button
    >
  </Tooltip>
{/if}
