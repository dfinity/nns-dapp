<script lang="ts" context="module">
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  type RowDataType = ResponsiveTableRowData;
</script>

<script lang="ts" generics="RowDataType extends ResponsiveTableRowData">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import ResponsiveTableRow from "$lib/components/ui/ResponsiveTableRow.svelte";
  import ResponsiveTableSortModal from "$lib/modals/common/ResponsiveTableSortModal.svelte";
  import type {
    ResponsiveTableColumn,
    ResponsiveTableOrder,
  } from "$lib/types/responsive-table";
  import {
    getCellGridAreaName,
    selectPrimaryOrder,
    sortTableData,
  } from "$lib/utils/responsive-table.utils";
  import { heightTransition } from "$lib/utils/transition.utils";
  import { IconSort, IconSouth } from "@dfinity/gix-components";
  import { assertNonNullish, isNullish, nonNullish } from "@dfinity/utils";

  export let testId = "responsive-table-component";
  export let tableData: Array<RowDataType>;
  export let columns: ResponsiveTableColumn<RowDataType>[];
  export let order: ResponsiveTableOrder = [];
  export let gridRowsPerTableRow = 1;
  export let getRowStyle: (rowData: RowDataType) => string | undefined = (_) =>
    undefined;

  let nonLastColumns: ResponsiveTableColumn<RowDataType>[];
  let lastColumn: ResponsiveTableColumn<RowDataType> | undefined;

  $: nonLastColumns = columns.slice(0, -1);
  $: lastColumn = columns.at(-1);

  let isSortingEnabled: boolean;
  $: isSortingEnabled = columns.some((column) => nonNullish(column.comparator));

  let sortedTableData: RowDataType[];
  $: sortedTableData = sortTableData({
    tableData,
    order,
    columns,
  });

  const orderBy = (column: ResponsiveTableColumn<RowDataType>) => {
    assertNonNullish(column.id);
    order = selectPrimaryOrder({ order, selectedColumnId: column.id });
  };

  let showSortModal = false;

  const openSortModal = () => {
    showSortModal = true;
  };

  const closeSortModal = () => {
    showSortModal = false;
  };

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

  // In mobile view, we only show the first column header and it should never be
  // sortable by clicking on it. So depending on whether the first column is
  // sortable we have or don't have separate first column headers for desktop
  // and mobile.
</script>

<TestIdWrapper {testId}>
  <div role="table" style={tableStyle}>
    <div role="rowgroup">
      <div role="row" class="header-row">
        {#each nonLastColumns as column, index}
          {#if isNullish(column.comparator) || index === 0}
            <span
              role="columnheader"
              style="--column-span: {column.templateColumns.length}"
              data-tid="column-header-{index + 1}"
              class={isNullish(column.comparator)
                ? `desktop-align-${column.alignment}`
                : ""}
              class:desktop-only={index > 0}
              class:mobile-only={nonNullish(column.comparator)}
              >{column.title}
            </span>
          {/if}
          {#if nonNullish(column.comparator)}
            <button
              role="columnheader"
              on:click={() => orderBy(column)}
              style="--column-span: {column.templateColumns.length}"
              data-tid="column-header-{index + 1}"
              class="desktop-only desktop-align-{column.alignment}"
              >{column.title}{#if nonNullish(column.comparator) && order[0]?.columnId === column.id}
                <span class="order-arrow">
                  <span class="arrow-icon" class:reversed={order[0].reversed}>
                    <IconSouth size="8" strokeWidth={2} />
                  </span>
                </span>
              {/if}
            </button>
          {/if}
        {/each}
        {#if lastColumn}
          <span
            role="columnheader"
            style="--column-span: {lastColumn.templateColumns.length}"
            class="desktop-align-{lastColumn.alignment} header-icon"
            >{#if isSortingEnabled}<button
                data-tid="open-sort-modal"
                class="mobile-only icon-only"
                on:click={openSortModal}><IconSort /></button
              >{/if}<slot name="header-icon" />
          </span>
        {/if}
      </div>
    </div>
    <div role="rowgroup">
      {#each sortedTableData as rowData (rowData.domKey)}
        <div
          class="row-wrapper"
          transition:heightTransition={{ duration: 250 }}
        >
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

  {#if showSortModal}
    <ResponsiveTableSortModal
      {columns}
      bind:order
      on:nnsClose={closeSortModal}
    />
  {/if}
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../themes/mixins/grid-table";

  div[role="table"] {
    width: 100%;

    display: flex;
    flex-direction: column;

    border-radius: var(--border-radius);
    // Otherwise the non-rounded corners of the header and last row would be visible.
    overflow-y: hidden;

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

      button[role="columnheader"] {
        color: var(--text-description);
        font-size: var(--font-size-small);
        padding: 0;

        &.desktop-align-left {
          text-align: left;
        }
      }

      .desktop-only {
        display: none;
      }

      @include media.min-width(medium) {
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: block;
        }
      }

      [role="columnheader"] {
        grid-column: span var(--column-span);

        &.desktop-align-right {
          text-align: right;
        }

        .order-arrow {
          display: inline-block;

          // If the column header is right aligned, we don't want it to be
          // pushed to the left by the arrow. So we give the arrow zero width so
          // it will overflow into the next column.
          width: 0;

          .arrow-icon {
            display: inline-block;
            margin: 0 var(--padding-0_5x);

            &.reversed {
              transform: rotate(180deg);
              transform-origin: center center;
            }
          }
        }
      }

      .header-icon {
        // Prevents the element taking up more height than the icon by adding
        // space for descenders.
        line-height: 0;

        color: var(--primary);
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
