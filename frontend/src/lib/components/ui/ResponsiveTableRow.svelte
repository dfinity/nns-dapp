<script lang="ts">
  import type { ResponsiveTableColumn } from "$lib/types/responsive-table";
  import type { UserToken } from "$lib/types/tokens-page";

  export let rowData: UserToken;
  export let columns: ResponsiveTableColumn<UserToken>[];

  let firstColumn: ResponsiveTableColumn<UserToken> | undefined;
  let middleColumns: ResponsiveTableColumn<UserToken>[];
  let lastColumn: ResponsiveTableColumn<UserToken> | undefined;

  $: firstColumn = columns.at(0);
  $: middleColumns = columns.slice(1, -1);
  $: lastColumn = columns.at(-1);

  // Should be the same as the area in the classes `rows-count-X`.
  const cellAreaName = (index: number) => `cell-${index}`;
  // This will allow us to have different number of rows depending on the number of columns.
  // It's not really necessary for the TokensTable becuase we know we want only 1 row.
  // But this should be moved when we make the generic table.
  const mobileTemplateClass = (rowsCount: number) => {
    return `rows-count-${rowsCount}`;
  };
</script>

<a
  href={rowData.rowHref}
  role="row"
  tabindex="0"
  data-tid="tokens-table-row-component"
  class={mobileTemplateClass(2)}
>
  {#if firstColumn}
    <div role="cell" class="title-cell">
      <svelte:component this={firstColumn.cellComponent} {rowData} />
    </div>
  {/if}

  {#each middleColumns as column, index}
    <div role="cell" class={`mobile-row-cell left-cell ${cellAreaName(index)}`}>
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
</a>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../themes/mixins/grid-table";

  [role="row"] {
    @include interaction.tappable;

    display: grid;
    flex-direction: column;
    gap: var(--padding-2x);

    text-decoration: none;

    &.rows-count-2 {
      grid-template-areas:
        "first-cell last-cell"
        "cell-0 cell-0";
    }

    &.rows-count-3 {
      grid-template-areas:
        "first-cell last-cell"
        "cell-0 cell-0"
        "cell-1 cell-1";
    }

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

      &.cell-0 {
        grid-area: cell-0;

        @include media.min-width(medium) {
          grid-area: revert;
        }
      }

      &.cell-1 {
        grid-area: cell-1;

        @include media.min-width(medium) {
          grid-area: revert;
        }
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
