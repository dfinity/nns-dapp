<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

<div data-tid="project-neurons-cell-component">
  {#if nonNullish(rowData.neuronCount)}
    {#if rowData.neuronCount > 0}
      {rowData.neuronCount}
    {:else}
      <!-- There is a click handler on the entire row so we don't need a specific click handler on the button. -->
      <button data-tid="stake-button" class="stake-button"
        >{replacePlaceholders($i18n.neurons.stake_token, {
          $token: rowData.tokenSymbol,
        })}</button
      >
    {/if}
  {:else}
    -/-
  {/if}
</div>

<style lang="scss">
  .stake-button {
    color: var(--primary);
  }
</style>
