<script lang="ts" context="module">
  import { getCellGridAreaName } from "$lib/utils/responsive-table.utils";
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  type RowDataType = ResponsiveTableRowData;
</script>

<script lang="ts" generics="RowDataType extends ResponsiveTableRowData">
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import { heightTransition } from "$lib/utils/transition.utils";
  import { nonNullish } from "@dfinity/utils";
  import ResponsiveTableRow from "$lib/components/ui/ResponsiveTableRow.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let testId = "responsive-table-component";
  export let tableData: Array<RowDataType>;
  export let columns: ResponsiveTableColumn<RowDataType>[];
  export let gridRowsPerTableRow = 1;
  export let getRowStyle: (rowData: RowDataType) => string | undefined = (_) =>
    undefined;

  let firstColumn: ResponsiveTableColumn<RowDataType> | undefined;
  let middleColumns: ResponsiveTableColumn<RowDataType>[];
  let lastColumn: ResponsiveTableColumn<RowDataType> | undefined;

  $: firstColumn = columns.at(0);
  $: middleColumns = columns.slice(1, -1);
  $: lastColumn = columns.at(-1);

  const getTableStyle = (columns: ResponsiveTableColumn<RowDataType>[]) => {
    // On desktop the first column gets all the remaining space after other
    // columns get as much as their content needs.
    const desktopGridTemplateColumns = columns
      .flatMap((column) => column.templateColumns)
      .join(" ");

    // On mobile, instead of a single row per data item, we have one row for the
    // first and last cell combined and a separate labeled row for each other
    // cell.
    let mobileGridTemplateAreas = '"first-cell last-cell"';
    for (let i = 1; i < columns.length - 1; i++) {
      if (nonNullish(columns[i].cellComponent)) {
        const areaName = getCellGridAreaName(i - 1);
        mobileGridTemplateAreas += ` "${areaName} ${areaName}"`;
      }
    }
    return (
      `--grid-rows-per-table-row: ${gridRowsPerTableRow}; ` +
      `--desktop-grid-template-columns: ${desktopGridTemplateColumns}; ` +
      `--mobile-grid-template-areas: ${mobileGridTemplateAreas};`
    );
  };

  let tableStyle: string;
  $: tableStyle = getTableStyle(columns);
</script>

<div role="table" data-tid={testId} style={tableStyle}>
  <div role="rowgroup">
    <div role="row" class="header-row">
      {#if firstColumn}
        <span
          role="columnheader"
          style="--column-span: {firstColumn.templateColumns.length}"
          data-tid="column-header-1"
          class="desktop-align-{firstColumn.alignment}"
          >{firstColumn.title}</span
        >
      {/if}
      {#each middleColumns as column, index}
        <span
          role="columnheader"
          style="--column-span: {column.templateColumns.length}"
          data-tid="column-header-{index + 2}"
          class="desktop-align-{column.alignment}">{column.title}</span
        >
      {/each}
      {#if lastColumn}
        <span
          role="columnheader"
          style="--column-span: {lastColumn.templateColumns.length}"
          class="desktop-align-{lastColumn.alignment} header-icon"
        >
          <slot name="header-icon" />
        </span>
      {/if}
    </div>
  </div>
  <div role="rowgroup">
    {#each tableData as rowData (rowData.domKey)}
      <div class="row-wrapper" transition:heightTransition={{ duration: 250 }}>
        <ResponsiveTableRow
          on:nnsAction
          {rowData}
          {columns}
          style={getRowStyle(rowData)}
        />
      </div>
    {/each}
  </div>
  {#if nonNullish($$slots["last-row"])}
    <TestIdWrapper testId="last-row">
      <slot name="last-row" />
    </TestIdWrapper>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../themes/mixins/grid-table";

  div[role="table"] {
    width: 100%;

    display: flex;
    flex-direction: column;

    border-radius: var(--border-radius);
    // Otherwise the non-rounded corners of the header and last row would be visible.
    overflow-y: auto;

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: var(--desktop-grid-template-columns);
      column-gap: var(--padding-2x);
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      color: var(--text-description);
      background-color: var(--table-header-background);

      font-weight: normal;
      font-size: var(--font-size-small);

      padding: 0 var(--padding-2x);
      height: var(--padding-4x);

      border-bottom: 1px solid var(--elements-divider);

      [role="columnheader"] {
        display: none;

        grid-column: span var(--column-span);

        &:first-child,
        &:last-child {
          display: block;
        }

        @include media.min-width(medium) {
          display: block;
        }
      }

      .desktop-align-right {
        text-align: right;
      }

      .header-icon {
        // Prevents the element taking up more height than the icon by adding
        // space for descenders.
        line-height: 0;
      }
    }

    [role="rowgroup"],
    [role="row"],
    .row-wrapper {
      @include media.min-width(medium) {
        @include grid-table.row;
      }
    }

    .row-wrapper {
      border-bottom: 1px solid var(--elements-divider);

      &:last-child {
        border-bottom: none;
      }

      @include media.min-width(medium) {
        border-bottom: none;
      }
    }
  }
</style>
