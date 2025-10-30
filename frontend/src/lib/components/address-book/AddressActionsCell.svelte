<script lang="ts">
  import type { AddressBookTableRowData } from "$lib/types/address-book";
  import { IconBin, IconSettings } from "@dfinity/gix-components";

  type Props = {
    rowData: AddressBookTableRowData;
  };

  const { rowData }: Props = $props();

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log("Edit", rowData.namedAddress.name);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log("Delete", rowData.namedAddress.name);
  };
</script>

<div data-tid="address-actions-cell" class="actions">
  <button
    class="icon-only"
    data-tid="edit-address-button"
    onclick={handleEdit}
    aria-label="Edit {rowData.namedAddress.name}"
  >
    <IconSettings />
  </button>
  <button
    class="icon-only"
    data-tid="delete-address-button"
    onclick={handleDelete}
    aria-label="Delete {rowData.namedAddress.name}"
  >
    <IconBin />
  </button>
</div>

<style lang="scss">
  .actions {
    display: flex;
    gap: var(--padding);
    justify-content: flex-end;
  }
</style>
