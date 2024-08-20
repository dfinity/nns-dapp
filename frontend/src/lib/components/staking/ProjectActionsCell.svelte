<script lang="ts">
  import type { TableProject } from "$lib/types/staking";
  import { IconRight } from "@dfinity/gix-components";

  export let rowData: TableProject;
</script>

{#if false}
  <!-- Satisfy the linter as it doesn't like unused props. -->
  {rowData.title}
{/if}

<div data-tid="go-to-neurons-table-action" class="container">
  <IconRight />
</div>

<style lang="scss">
  .container {
    color: var(--primary);
    display: flex;
    align-items: center;
  }
</style>
