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
  import {
    IconSouth,
    ChipGroup,
    type ChipGroupItem,
  } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let columns: ResponsiveTableColumn<RowDataType>[];
  export let order: ResponsiveTableOrder;

  let chips: ChipGroupItem[] = [];
  $: chips = columns
    .filter(({ comparator }) => nonNullish(comparator))
    .map(({ id, title }) => ({
      id: id ?? title,
      label: title,
      selected: order[0]?.columnId === id,
    }));

  let isReversed: boolean;
  $: isReversed = order[0]?.reversed ?? false;

  const orderBy = async (selectedColumnId: string) =>
    (order = selectPrimaryOrder({ order, selectedColumnId }));
  const onNnsSelect = ({ detail: selectedId }: CustomEvent<string>) =>
    orderBy(selectedId);
  const reverseOrder = () => orderBy(order[0].columnId);
</script>

<div
  class="responsive-table-sort-control"
  data-tid="responsive-table-sort-control-component"
>
  <div class="header">
    <h5>{$i18n.responsive_table.sorting}</h5>
    <button
      class="direction-button ghost with-icon"
      data-tid="sort-direction-button"
      on:click={reverseOrder}
    >
      {isReversed
        ? $i18n.responsive_table.ascending_order
        : $i18n.responsive_table.descending_order}
      <div class="icon" class:reversed={isReversed}
        ><IconSouth size="20px" /></div
      >
    </button>
  </div>

  <ChipGroup {chips} on:nnsSelect={onNnsSelect} />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .responsive-table-sort-control {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding);
  }

  h5 {
    margin: 0;
    @include fonts.standard(true);
    color: var(--description-color);
  }

  .direction-button {
    display: flex;
    gap: var(--padding-0_5x);
    align-items: center;

    @include fonts.small(true);
    color: var(--description-color);
  }

  .icon {
    display: flex;
    color: var(--primary);

    &.reversed {
      transform: rotate(180deg);
    }
  }
</style>
