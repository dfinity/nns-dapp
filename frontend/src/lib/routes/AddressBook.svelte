<script lang="ts">
  import AddressActionsCell from "$lib/components/address-book/AddressActionsCell.svelte";
  import AddressCell from "$lib/components/address-book/AddressCell.svelte";
  import LabelCell from "$lib/components/address-book/LabelCell.svelte";
  import IslandWidthMain from "$lib/components/layout/IslandWidthMain.svelte";
  import ResponsiveTable from "$lib/components/ui/ResponsiveTable.svelte";
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { MAX_ADDRESS_BOOK_ENTRIES } from "$lib/constants/address-book.constants";
  import AddAddressModal from "$lib/modals/address-book/AddAddressModal.svelte";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { AddressBookTableRowData } from "$lib/types/address-book";
  import type {
    ResponsiveTableColumn,
    ResponsiveTableOrder,
  } from "$lib/types/responsive-table";
  import { createAscendingComparator } from "$lib/utils/sort.utils";
  import {
    IconAdd,
    IconUserLogin,
    Spinner,
    Tooltip,
  } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  layoutTitleStore.set({
    title: $i18n.navigation.address_book,
  });

  let showAddAddressModal = $state(false);
  let editingAddress = $state<NamedAddress | undefined>(undefined);
  let order = $state<ResponsiveTableOrder>([{ columnId: "label" }]);

  // Check if data is still loading (undefined means not loaded yet)
  const isLoading = $derived($addressBookStore.namedAddresses === undefined);

  const isEmpty = $derived(
    nonNullish($addressBookStore.namedAddresses) &&
      $addressBookStore.namedAddresses.length === 0
  );

  const isMaxReached = $derived(
    nonNullish($addressBookStore.namedAddresses) &&
      ($addressBookStore.namedAddresses.length ?? 0) >= MAX_ADDRESS_BOOK_ENTRIES
  );

  const openAddAddressModal = () => {
    editingAddress = undefined;
    showAddAddressModal = true;
  };

  const openEditAddressModal = (namedAddress: NamedAddress) => {
    editingAddress = namedAddress;
    showAddAddressModal = true;
  };

  const closeAddAddressModal = () => {
    showAddAddressModal = false;
    editingAddress = undefined;
  };

  const addressBookData = $derived.by((): AddressBookTableRowData[] => {
    const addresses = $addressBookStore.namedAddresses;
    if (!nonNullish(addresses)) return [];

    return addresses.map((namedAddress) => ({
      domKey: namedAddress.name,
      namedAddress,
      rowContext: {
        onEdit: openEditAddressModal,
      },
    }));
  });

  const compareByNickname = createAscendingComparator(
    (rowData: AddressBookTableRowData) => rowData.namedAddress.name
  );

  const columns = [
    {
      id: "label",
      title: $i18n.address_book.nickname_label,
      cellComponent: LabelCell,
      alignment: "left",
      templateColumns: ["1fr"],
      comparator: compareByNickname,
    },
    {
      title: $i18n.address_book.address_label,
      cellComponent: AddressCell,
      alignment: "left",
      templateColumns: ["2fr"],
    },
    {
      title: "",
      cellComponent: AddressActionsCell,
      alignment: "right",
      templateColumns: ["max-content"],
    },
  ] as unknown as ResponsiveTableColumn<AddressBookTableRowData, string>[];
</script>

{#snippet addButton({ disabled = false } = {})}
  <button
    data-tid="add-address-button"
    class="primary"
    onclick={openAddAddressModal}
    {disabled}
  >
    <div class="add-address-button-content">
      <IconAdd size="20" />
      {$i18n.address_book.add_address}
    </div>
  </button>
{/snippet}

<IslandWidthMain>
  <div class="content" data-tid="address-book-content">
    {#if isLoading}
      <Spinner />
    {:else if isEmpty}
      <div class="is-empty">
        <IconUserLogin size={144} />
        <div class="text">
          <p class="title">{$i18n.address_book.title}</p>
          <p class="description">{$i18n.address_book.description}</p>
          {@render addButton()}
        </div>
      </div>
    {:else}
      <div class="table-container">
        <div class="header">
          {#if isMaxReached}
            <Tooltip
              id="add-address-button-disabled"
              text={$i18n.address_book.max_addresses_reached}
            >
              {@render addButton({ disabled: true })}
            </Tooltip>
          {:else}
            {@render addButton()}
          {/if}
        </div>
        <ResponsiveTable tableData={addressBookData} {columns} bind:order />
      </div>
    {/if}
  </div>
</IslandWidthMain>

{#if showAddAddressModal}
  <AddAddressModal
    onClose={closeAddAddressModal}
    namedAddress={editingAddress}
  />
{/if}

<style lang="scss">
  .is-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    border-radius: var(--border-radius-2x);
    background-color: var(--sidebar-button-background);
    text-align: center;
    gap: var(--padding);

    .title {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .title {
      font-weight: 450;
      font-size: 16px;
      line-height: 20px;
      color: var(--text-description);
    }

    .description {
      max-width: 360px;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
      color: var(--text-description);
      margin-bottom: 32px;
    }

    .add-address-button-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .table-container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    .header {
      display: flex;
      justify-content: flex-end;
    }

    .add-address-button-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
</style>
