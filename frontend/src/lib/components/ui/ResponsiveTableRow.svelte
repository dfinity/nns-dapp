<script lang="ts" context="module">
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  type RowDataType = ResponsiveTableRowData;
</script>

<script lang="ts" generics="RowDataType extends ResponsiveTableRowData">
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import { getCellGridAreaName } from "$lib/utils/responsive-table.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let rowData: RowDataType;
  export let columns: ResponsiveTableColumn<RowDataType>[];
  export let style: string | undefined = undefined;

  let firstColumn: ResponsiveTableColumn<RowDataType> | undefined;
  let middleColumns: ResponsiveTableColumn<RowDataType>[];
  let lastColumn: ResponsiveTableColumn<RowDataType> | undefined;

  $: firstColumn = columns.at(0);
  $: middleColumns = columns.slice(1, -1);
  $: lastColumn = columns.at(-1);

  const dispatcher = createEventDispatcher();

  const onRowClick = () => {
    if (nonNullish(rowData.rowHref)) {
      // We don't interfere with normal link behavior.
      return;
    }
    dispatcher("nnsAction", { rowData });
  };

  const getCellStyle = ({
    column,
    index,
  }: {
    column: ResponsiveTableColumn<RowDataType>;
    index?: number;
  }) =>
    `--desktop-column-span: ${column.templateColumns.length};` +
    `--mobile-template-columns: ${column.templateColumns.join(" ")};` +
    (nonNullish(index)
      ? `--grid-area-name: ${getCellGridAreaName(index)};`
      : "");
</script>

<svelte:element
  this={nonNullish(rowData.rowHref) ? "a" : "div"}
  href={rowData.rowHref}
  role="row"
  tabindex="0"
  data-tid="responsive-table-row-component"
  on:click={onRowClick}
  {style}
>
  {#if firstColumn}
    <div
      role="cell"
      class:subgrid-cell={firstColumn.templateColumns.length > 1}
      class="first-cell desktop-align-{firstColumn.alignment}"
      style={getCellStyle({ column: firstColumn })}
    >
      <div class="cell-body">
        <svelte:component this={firstColumn.cellComponent} {rowData} />
      </div>
    </div>
  {/if}

  {#each middleColumns as column, index}
    <div
      role="cell"
      class:subgrid-cell={column.templateColumns.length > 1}
      class:empty-cell={isNullish(column.cellComponent)}
      class="middle-cell desktop-align-{column.alignment}"
      style={getCellStyle({ column, index })}
    >
      {#if nonNullish(column.cellComponent)}
        <span class="middle-cell-label">{column.title}</span>
        <div class="cell-body">
          <svelte:component this={column.cellComponent} {rowData} />
        </div>
      {/if}
    </div>
  {/each}

  {#if lastColumn}
    <div
      role="cell"
      class:subgrid-cell={lastColumn.templateColumns.length > 1}
      class="last-cell actions desktop-align-{lastColumn.alignment}"
      style={getCellStyle({ column: lastColumn })}
    >
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
    // Styles for desktop and mobile:
    color: var(--table-row-text-color, inherit);

    display: grid;
    text-decoration: none;
    background-color: var(--table-row-background);

    // Styles for mobile (and overridden for desktop):

    padding: var(--padding-3x);
    row-gap: var(--padding-1_5x);
    grid-template-areas: var(--mobile-grid-template-areas);

    // Styles applied to desktop only:

    @include media.min-width(medium) {
      @include grid-table.row;
      padding: var(--padding-2x);
      row-gap: 0;
      grid-template-areas: none;
    }

    &:hover {
      background-color: var(--table-row-background-hover);
    }
  }

  div[role="cell"] {
    // On desktop we have one large grid. Some table cells take up a single
    // grid cell, while others span multiple cells because they have to align
    // with the grid lines. The single-cell cells use `display: flex` while
    // the aligned cells use `display: grid`.
    //
    // On mobile, there is no alignment between different cells and all cells
    // get display: flex.
    //
    // But the cells that expect to be in a grid, still need their grid
    // defined. This happens in the cell-body div. On desktop these get
    // `display: contents` to get their grid lines from the larger grid, while
    // on mobile they get their own grid from `--mobile-template-columns`.

    // Styles applied to desktop and mobile:

    display: flex;
    align-items: center;

    // Styles applied to mobile (and overridden for desktop):

    &.empty-cell {
      display: none;
    }

    &.subgrid-cell {
      .cell-body {
        display: grid;
        grid-template-columns: var(--mobile-template-columns);
      }
    }

    &.first-cell {
      grid-area: first-cell;
      margin-bottom: var(--padding-0_5x);
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
      &.empty-cell {
        display: flex;
      }

      &.subgrid-cell {
        display: grid;
        grid-template-columns: subgrid;
        grid-template-rows: subgrid;

        .cell-body {
          display: contents;
        }
      }

      .middle-cell-label {
        display: none;
      }

      &.first-cell {
        margin-bottom: 0;
      }

      &.first-cell,
      &.middle-cell,
      &.last-cell {
        grid-area: revert;
        grid-column: span var(--desktop-column-span);
        grid-row: span var(--grid-rows-per-table-row);
      }

      &.desktop-align-left {
        justify-content: flex-start;
        text-align: start;
      }

      &.desktop-align-right {
        justify-content: flex-end;
        text-align: end;
      }
    }
  }
</style>
