<script lang="ts">
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  import { SkeletonText } from "@dfinity/gix-components";

  // svelte-ignore unused-export-let
  export let rowData: ResponsiveTableRowData;
</script>

<div class="skeleton-table-cell" data-tid="skeleton-table-cell">
  <SkeletonText />
</div>

<style lang="scss">
  .skeleton-table-cell {
    width: 100%;
    // A column sized by its content still needs a width for the placeholder.
    min-width: calc(10 * var(--padding));
  }
</style>
