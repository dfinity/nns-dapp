<script lang="ts" context="module">
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  type RowDataType = ResponsiveTableRowData;
</script>

<script lang="ts" generics="RowDataType extends ResponsiveTableRowData">
  import { getCellGridAreaName } from "$lib/utils/responsive-table.utils";
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import { nonNullish } from "@dfinity/utils";

  export let rowData: RowDataType;
  export let columns: ResponsiveTableColumn<RowDataType>[];

  let firstColumn: ResponsiveTableColumn<RowDataType> | undefined;
  let middleColumns: ResponsiveTableColumn<RowDataType>[];
  let lastColumn: ResponsiveTableColumn<RowDataType> | undefined;

  $: firstColumn = columns.at(0);
  $: middleColumns = columns.slice(1, -1);
  $: lastColumn = columns.at(-1);
</script>

<svelte:element
  this={nonNullish(rowData.rowHref) ? "a" : "div"}
  href={rowData.rowHref}
  role="row"
  tabindex="0"
  data-tid="responsive-table-row-component"
>
  {#if firstColumn}
    <div role="cell" class="title-cell">
      <svelte:component this={firstColumn.cellComponent} {rowData} />
    </div>
  {/if}

  {#each middleColumns as column, index}
    <div
      role="cell"
      class={`mobile-row-cell left-cell`}
      style="--grid-area-name: {getCellGridAreaName(index)}"
    >
      <span class="mobile-only">{column.title}</span>
      <svelte:component this={column.cellComponent} {rowData} />
    </div>
  {/each}

  {#if lastColumn}
    <div role="cell" class="actions-cell actions">
      <svelte:component
        this={lastColumn.cellComponent}
        {rowData}
        on:nnsAction
      />
    </div>
  {/if}
</svelte:element>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../themes/mixins/grid-table";

  [role="row"] {
    display: grid;
    flex-direction: column;
    gap: var(--padding-2x);

    text-decoration: none;

    grid-template-areas: var(--mobile-grid-template-areas);

    @include media.min-width(medium) {
      @include grid-table.row;
      row-gap: 0;
      grid-template-areas: none;
    }

    padding: var(--padding-2x);

    background-color: var(--table-row-background);

    @include media.min-width(medium) {
      grid-template-rows: 1fr;
    }

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }

  div[role="cell"] {
    display: flex;
    align-items: center;
    gap: var(--padding);

    &.title-cell {
      grid-area: first-cell;

      @include media.min-width(medium) {
        grid-area: revert;
      }
    }

    &.actions-cell {
      display: flex;
      justify-content: flex-end;

      grid-area: last-cell;

      @include media.min-width(medium) {
        grid-area: revert;
      }
    }

    &.mobile-row-cell {
      display: flex;
      justify-content: space-between;

      grid-area: var(--grid-area-name);

      @include media.min-width(medium) {
        grid-area: revert;
      }

      @include media.min-width(medium) {
        &.left-cell {
          justify-content: flex-end;
        }
      }
    }
  }

  .actions {
    :global(svg) {
      color: var(--primary);
    }
  }

  .mobile-only {
    display: block;

    @include media.min-width(medium) {
      display: none;
    }
  }
</style>
