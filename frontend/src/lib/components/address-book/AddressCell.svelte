<script lang="ts">
  import Hash from "$lib/components/ui/Hash.svelte";
  import type { AddressBookTableRowData } from "$lib/types/address-book";

  type Props = {
    rowData: AddressBookTableRowData;
  };

  const { rowData }: Props = $props();

  const addressText = $derived(
    "Icp" in rowData.namedAddress.address
      ? rowData.namedAddress.address.Icp
      : rowData.namedAddress.address.Icrc1
  );
</script>

<div data-tid="address-cell">
  <Hash text={addressText} tagName="span" idPrefix="address-cell" showCopy />
</div>

<style lang="scss">
  div {
    display: flex;
    align-items: center;
  }
</style>
