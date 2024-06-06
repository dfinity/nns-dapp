<script lang="ts">
  import { IconRight } from "@dfinity/gix-components";
  import type { TableNeuron } from "$lib/types/neurons-table";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: TableNeuron;
</script>

{#if nonNullish(rowData.rowHref)}
  <div data-tid="go-to-neuron-detail-action" class="container">
    <IconRight />
  </div>
{/if}

<style lang="scss">
  .container {
    color: var(--primary);
    display: flex;
    height: 20px;
    align-items: center;
  }
</style>
