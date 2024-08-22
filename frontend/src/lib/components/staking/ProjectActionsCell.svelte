<script lang="ts">
  import type { TableProject } from "$lib/types/staking";
  import { IconRight } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;

  // The row is clickable if either:
  // * it has a rowHref to navigate to the neurons table, or
  // * it has 0 neurons because then you can click to stake a neuron.
  //
  // This means the row is not clickable if
  // * the user is not signed in, or
  // * neurons are still being loaded.
  //
  // The presence of the IconRight icon indicates that the row is clickable.
</script>

{#if nonNullish(rowData.rowHref) || rowData.neuronCount === 0}
  <div data-tid="go-to-neurons-table-action" class="container">
    <IconRight />
  </div>
{/if}

<style lang="scss">
  .container {
    color: var(--primary);
    display: flex;
    align-items: center;
  }
</style>
