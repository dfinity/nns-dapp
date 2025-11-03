<script lang="ts">
  import InputWithError from "$lib/components/ui/InputWithError.svelte";
  import type { NamedAddress } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { saveAddressBook } from "$lib/services/address-book.services";
  import { addressBookStore } from "$lib/stores/address-book.store";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import {
    invalidIcpAddress,
    invalidIcrcAddress,
  } from "$lib/utils/accounts.utils";
  import { Modal, busy } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  interface Props {
    onClose?: () => void;
    namedAddress?: NamedAddress;
  }

  const { onClose, namedAddress }: Props = $props();

  // Helper function to extract address string from AddressType
  const getAddressString = (addressType: NamedAddress["address"]): string => {
    if ("Icp" in addressType) {
      return addressType.Icp;
    }
    if ("Icrc1" in addressType) {
      return addressType.Icrc1;
    }
    return "";
  };

  // Helper function to normalize names for comparison (case-insensitive, trimmed)
  const normalizeName = (name: string): string => name.trim().toLowerCase();

  // Determine if we're in edit mode
  const isEditMode = nonNullish(namedAddress);

  // Initialize fields with existing data if in edit mode
  let nickname = $state(namedAddress?.name ?? "");
  let address = $state(
    namedAddress ? getAddressString(namedAddress.address) : ""
  );

  // Error messages - set on submit, cleared on change
  let nicknameError = $state<string | undefined>(undefined);
  let addressError = $state<string | undefined>(undefined);

  // Validate nickname
  const validateNickname = (): string | undefined => {
    if (nickname === "") {
      return undefined;
    }
    if (nickname.length < 3) {
      return $i18n.address_book.nickname_too_short;
    }
    if (nickname.length > 20) {
      return $i18n.address_book.nickname_too_long;
    }
    // Check uniqueness: normalize both sides (trim + lowercase) for comparison
    const normalizedNickname = normalizeName(nickname);
    if (
      $addressBookStore.namedAddresses?.some((entry) => {
        // In edit mode, exclude the current entry from uniqueness check
        if (
          isEditMode &&
          normalizeName(entry.name) === normalizeName(namedAddress?.name ?? "")
        ) {
          return false;
        }
        return normalizeName(entry.name) === normalizedNickname;
      })
    ) {
      return $i18n.address_book.nickname_already_used;
    }
    return undefined;
  };

  // Validate address
  const validateAddress = (): string | undefined => {
    if (address === "") {
      return undefined;
    }
    const isInvalidIcp = invalidIcpAddress(address);
    const isInvalidIcrc = invalidIcrcAddress(address);

    if (isInvalidIcp && isInvalidIcrc) {
      return $i18n.address_book.invalid_address;
    }
    return undefined;
  };

  // Check if nothing has changed in edit mode
  const hasChanges = $derived(
    nickname !== (namedAddress?.name ?? "") ||
      address !== (namedAddress ? getAddressString(namedAddress.address) : "")
  );

  // Determine if save button should be disabled
  // Disabled only if: fields are empty, errors are shown, busy, or no changes in edit mode
  const disableSave = $derived(
    nickname === "" ||
      address === "" ||
      nonNullish(nicknameError) ||
      nonNullish(addressError) ||
      $busy ||
      // In edit mode, disable if nothing changed
      (isEditMode && !hasChanges)
  );

  const close = () => onClose?.();

  const resetForm = () => {
    nickname = "";
    address = "";
    nicknameError = undefined;
    addressError = undefined;
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();

    // Validate and set errors
    nicknameError = validateNickname();
    addressError = validateAddress();

    // If there are errors, stop here
    if (nonNullish(nicknameError) || nonNullish(addressError)) {
      return;
    }

    // Determine address type
    const isValidIcrc = !invalidIcrcAddress(address);
    const addressType = isValidIcrc ? { Icrc1: address } : { Icp: address };

    // Create new or updated named address
    const updatedAddress: NamedAddress = {
      name: nickname,
      address: addressType,
    };

    // Create temporary array with the updated addresses
    const currentAddresses = $addressBookStore.namedAddresses ?? [];
    let updatedAddresses: NamedAddress[];

    if (isEditMode) {
      // In edit mode, find and replace the existing entry
      updatedAddresses = currentAddresses.map((entry) =>
        normalizeName(entry.name) === normalizeName(namedAddress?.name ?? "")
          ? updatedAddress
          : entry
      );
    } else {
      // In add mode, append the new address
      updatedAddresses = [...currentAddresses, updatedAddress];
    }

    const initiator = isEditMode
      ? "edit-address-book-entry"
      : "add-address-book-entry";
    startBusy({ initiator });

    try {
      const result = await saveAddressBook(updatedAddresses);

      if (!result?.err) {
        toastsSuccess({
          labelKey: isEditMode
            ? "address_book.edit_success"
            : "address_book.add_success",
        });
        resetForm();
        close();
      } else {
        // Error already handled by saveAddressBook (toast shown)
        // Keep modal open with current data
      }
    } finally {
      stopBusy(initiator);
    }
  };
</script>

<Modal testId="add-address-modal" onClose={close}>
  {#snippet title()}
    <span data-tid="add-address-modal-title"
      >{isEditMode
        ? $i18n.address_book.edit_address
        : $i18n.address_book.add_address}</span
    >
  {/snippet}

  <form onsubmit={handleSubmit}>
    <div class="fields">
      <InputWithError
        testId="nickname-input"
        bind:value={nickname}
        inputType="text"
        placeholderLabelKey="address_book.nickname_placeholder"
        name="nickname"
        required={true}
        errorMessage={nicknameError}
        disabled={$busy}
        onInput={() => (nicknameError = undefined)}
      >
        <svelte:fragment slot="label"
          >{$i18n.address_book.nickname_label}</svelte:fragment
        >
      </InputWithError>

      <InputWithError
        testId="address-input"
        bind:value={address}
        inputType="text"
        placeholderLabelKey="address_book.address_placeholder"
        name="address"
        required={true}
        errorMessage={addressError}
        disabled={$busy}
        onInput={() => (addressError = undefined)}
      >
        <svelte:fragment slot="label"
          >{$i18n.address_book.address_label}</svelte:fragment
        >
      </InputWithError>
    </div>

    <div class="toolbar">
      <button
        class="secondary"
        type="button"
        data-tid="cancel-button"
        disabled={$busy}
        onclick={close}
      >
        {$i18n.core.cancel}
      </button>
      <button
        data-tid="save-address-button"
        class="primary"
        type="submit"
        disabled={disableSave}
      >
        {$i18n.address_book.save_address}
      </button>
    </div>
  </form>
</Modal>

<style lang="scss">
  .fields {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }

  .toolbar {
    display: flex;
    gap: var(--padding);
    padding: var(--padding) var(--padding) var(--padding-2x);
  }

  form {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>
