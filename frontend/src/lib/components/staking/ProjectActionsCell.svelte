<script lang="ts">
  import type { TableProject } from "$lib/types/staking";
  import { IconRight } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableProject;
</script>

{#if nonNullish(rowData.rowHref)}
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
