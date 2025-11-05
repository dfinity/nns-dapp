<script lang="ts">
  import type { AddressBookTableRowData } from "$lib/types/address-book";

  type Props = {
    rowData: AddressBookTableRowData;
  };

  const { rowData }: Props = $props();
</script>

<div data-tid="label-cell">
  <span class="label">{rowData.namedAddress.name}</span>
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .label {
    font-weight: 500;
  }
</style>
