<script lang="ts" context="module">
  import type { ResponsiveTableRowData } from "$lib/types/responsive-table";
  type RowDataType = ResponsiveTableRowData;
</script>

<script lang="ts" generics="RowDataType extends ResponsiveTableRowData">
  import { i18n } from "$lib/stores/i18n";
  import type {
    ResponsiveTableColumn,
    ResponsiveTableOrder,
  } from "$lib/types/responsive-table";
  import { selectPrimaryOrder } from "$lib/utils/responsive-table.utils";
  import { waitForMilliseconds } from "$lib/utils/utils";
  import { IconSouth, Modal } from "@dfinity/gix-components";
  import { assertNonNullish, nonNullish } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let columns: ResponsiveTableColumn<RowDataType>[];
  export let order: ResponsiveTableOrder;

  const dispatch = createEventDispatcher();

  const orderBy = async (column: ResponsiveTableColumn<RowDataType>) => {
    assertNonNullish(column.id);
    order = selectPrimaryOrder({ order, selectedColumnId: column.id });
    // Delay so the user can see the new selection before the modal closes.
    await waitForMilliseconds(250);
    dispatch("nnsClose");
  };
</script>

<Modal testId="responsive-table-sort-modal-component" on:nnsClose>
  <svelte:fragment slot="title"
    >{$i18n.responsive_table.sort_by}</svelte:fragment
  >
  {#each columns as column}
    {#if nonNullish(column.comparator)}
      <button
        data-tid="sort-option"
        class="sort-label"
        class:selected={order[0]?.columnId === column.id}
        on:click={() => orderBy(column)}
      >
        <span data-tid="sort-option-title">{column.title}</span>
        {#if order[0]?.columnId === column.id}<span class="reverse-description"
            >{$i18n.responsive_table.tap_to_reverse}<span
              data-tid="arrow"
              class="arrow-icon"
              class:reversed={order[0].reversed}
              ><IconSouth size="16" strokeWidth={2} /></span
            ></span
          >{/if}</button
      >
    {/if}
  {/each}
</Modal>

<style lang="scss">
  .sort-label {
    display: flex;
    width: 100%;
    justify-content: space-between;

    font-weight: var(--font-weight-bold);
    padding: var(--padding-2x);

    .reverse-description {
      display: flex;
      align-items: center;
      color: var(--primary);
      font-size: var(--font-size-small);
    }

    .arrow-icon {
      color: var(--primary);
      // Should match the size="16" of the IconSouth above.
      height: 16px;
      margin-left: var(--padding);

      &.reversed {
        transform: rotate(180deg);
      }
    }

    border: 2px solid transparent;
    border-radius: var(--border-radius);

    &.selected {
      border-color: var(--primary);
    }
  }
</style>
