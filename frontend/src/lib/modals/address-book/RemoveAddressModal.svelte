<script lang="ts">
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { saveAddressBook } from "$lib/services/address-book.services";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { IconErrorOutline } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";

  interface Props {
    onClose: () => void;
    namedAddress: NamedAddress;
  }

  const { onClose, namedAddress }: Props = $props();

  const handleDeleteConfirm = async () => {
    if (isNullish($addressBookStore.namedAddresses)) {
      return;
    }

    const updatedAddresses = $addressBookStore.namedAddresses.filter(
      (entry) => entry.name !== namedAddress.name
    );

    const initiator = "delete-address-book-entry";
    startBusy({ initiator });

    try {
      const result = await saveAddressBook(updatedAddresses);

      if (!result?.err) {
        toastsSuccess({
          labelKey: "address_book.delete_success",
        });
        onClose();
      } else {
        // Error already handled by saveAddressBook (toast shown)
        // Keep modal open
      }
    } finally {
      stopBusy(initiator);
    }
  };
</script>

<ConfirmationModal on:nnsClose={onClose} on:nnsConfirm={handleDeleteConfirm}>
  <div data-tid="remove-address-confirmation" class="wrapper">
    <h4>
      {replacePlaceholders($i18n.address_book.remove_address_title, {
        $label: namedAddress.name,
      })}
    </h4>

    <div class="icon-wrapper">
      <div class="icon">
        <IconErrorOutline size="16" />
      </div>
      {$i18n.address_book.remove_address_message}
    </div>
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  .icon-wrapper {
    padding-top: var(--padding-2x);
    color: var(--description-color);
    justify-content: center;
    align-items: center;
    gap: var(--padding);
    display: flex;
    width: 100%;

    .icon {
      background-color: var(--negative-emphasis-light);
      color: var(--negative-emphasis);
      justify-content: center;
      padding: var(--padding-0_5x);
      align-items: center;
      border-radius: 100%;
      display: flex;
      flex-grow: 0;
    }
  }

  .wrapper {
    @include confirmation-modal.wrapper;
    text-align: center;
  }

  h4 {
    @include confirmation-modal.title;
  }
</style>
