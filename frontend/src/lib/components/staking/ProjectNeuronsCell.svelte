<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let rowData: TableProject;

  const dispatch = createEventDispatcher();
</script>

<div data-tid="project-neurons-cell-component">
  {#if nonNullish(rowData.neuronCount)}
    {#if rowData.neuronCount > 0}
      {rowData.neuronCount}
    {:else}
      <!-- Use preventDefault because of a click handler on the entire row. -->
      <button
        data-tid="stake-button"
        class="stake-button"
        on:click|stopPropagation|preventDefault={() =>
          dispatch("nnsAction", { rowData })}
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
