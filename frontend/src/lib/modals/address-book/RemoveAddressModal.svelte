<script lang="ts">
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
  import { saveAddressBook } from "$lib/services/address-book.services";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
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
    <p>{$i18n.address_book.remove_address_message}</p>
  </div>
</ConfirmationModal>

<style lang="scss">
  @use "../../themes/mixins/confirmation-modal";

  .wrapper {
    @include confirmation-modal.wrapper;
  }

  h4 {
    @include confirmation-modal.title;
  }

  p {
    @include confirmation-modal.text;
  }
</style>
