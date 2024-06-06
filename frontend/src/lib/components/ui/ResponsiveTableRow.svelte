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
    <div role="cell" class="first-cell desktop-align-{firstColumn.alignment}">
      <div class="cell-body">
        <svelte:component this={firstColumn.cellComponent} {rowData} />
      </div>
    </div>
  {/if}

  {#each middleColumns as column, index}
    <div
      role="cell"
      class="middle-cell desktop-align-{column.alignment}"
      style="--grid-area-name: {getCellGridAreaName(index)}"
    >
      <span class="middle-cell-label">{column.title}</span>
      <div class="cell-body">
        <svelte:component this={column.cellComponent} {rowData} />
      </div>
    </div>
  {/each}

  {#if lastColumn}
    <div role="cell" class="last-cell desktop-align-{lastColumn.alignment}">
      <div class="cell-body">
        <svelte:component
          this={lastColumn.cellComponent}
          {rowData}
          on:nnsAction
        />
      </div>
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

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }

  div[role="cell"] {
    // Styles applied to desktop and mobile:

    display: flex;
    align-items: center;

    // Styles applied to mobile (and overridden for desktop)::

    &.first-cell {
      grid-area: first-cell;
    }

    &.last-cell {
      justify-content: flex-end;

      grid-area: last-cell;
    }

    &.middle-cell {
      justify-content: space-between;

      grid-area: var(--grid-area-name);
    }

    // Styles applied to desktop only:

    @include media.min-width(medium) {
      .middle-cell-label {
        display: none;
      }

      &.first-cell,
      &.middle-cell,
      &.last-cell {
        grid-area: revert;
      }

      &.desktop-align-left {
        justify-content: flex-start;
      }

      &.desktop-align-right {
        justify-content: flex-end;
      }
    }
  }
</style>
