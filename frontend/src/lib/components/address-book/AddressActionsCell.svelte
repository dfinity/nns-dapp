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
    class="icon-only icon-settings"
    data-tid="edit-address-button"
    onclick={handleEdit}
    aria-label="Edit {rowData.namedAddress.name}"
  >
    <IconSettings />
  </button>
  <button
    class="icon-only icon-bin"
    data-tid="delete-address-button"
    onclick={handleDelete}
    aria-label="Delete {rowData.namedAddress.name}"
  >
    <IconBin />
  </button>
</div>

<style lang="scss">
  .icon-settings {
    color: var(--primary);
  }
  .icon-bin {
    color: var(--negative-emphasis);
  }
  .actions {
    display: flex;
    gap: var(--padding);
    justify-content: flex-end;
  }
</style>
