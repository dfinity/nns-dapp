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
  }

  let { onClose }: Props = $props();

  let nickname = $state("");
  let address = $state("");

  // Validate nickname
  const nicknameError = $derived.by(() => {
    if (nickname === "") {
      return undefined;
    }
    if (nickname.length < 3) {
      return $i18n.address_book.nickname_too_short;
    }
    if (nickname.length > 20) {
      return $i18n.address_book.nickname_too_long;
    }
    if (
      $addressBookStore.namedAddresses?.some(
        (namedAddress) => namedAddress.name === nickname
      )
    ) {
      return $i18n.address_book.nickname_already_used;
    }
    return undefined;
  });

  // Validate address
  const addressError = $derived.by(() => {
    if (address === "") {
      return undefined;
    }
    const isInvalidIcp = invalidIcpAddress(address);
    const isInvalidIcrc = invalidIcrcAddress(address);

    if (isInvalidIcp && isInvalidIcrc) {
      return $i18n.address_book.invalid_address;
    }
    return undefined;
  });

  // Determine if save button should be disabled
  const disableSave = $derived(
    nickname === "" ||
      address === "" ||
      nonNullish(nicknameError) ||
      nonNullish(addressError) ||
      $busy
  );

  const close = () => onClose?.();

  const resetForm = () => {
    nickname = "";
    address = "";
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    // Determine address type
    const isValidIcrc = !invalidIcrcAddress(address);
    const addressType = isValidIcrc ? { Icrc1: address } : { Icp: address };

    // Create new named address
    const newAddress: NamedAddress = {
      name: nickname,
      address: addressType,
    };

    // Create temporary array with the new address
    const currentAddresses = $addressBookStore.namedAddresses ?? [];
    const updatedAddresses = [...currentAddresses, newAddress];

    startBusy({ initiator: "add-address-book-entry" });

    try {
      const result = await saveAddressBook(updatedAddresses);

      if (!result?.err) {
        toastsSuccess({
          labelKey: "address_book.add_success",
        });
        resetForm();
        close();
      } else {
        // Error already handled by saveAddressBook (toast shown)
        // Keep modal open with current data
      }
    } finally {
      stopBusy("add-address-book-entry");
    }
  };
</script>

<Modal testId="add-address-modal" onClose={close}>
  {#snippet title()}
    <span data-tid="add-address-modal-title"
      >{$i18n.address_book.add_address}</span
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
        minLength={3}
        disabled={$busy}
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
