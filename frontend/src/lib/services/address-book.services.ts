import { getAddressBook, setAddressBook } from "$lib/api/address-book.api";
import {
  AccountNotFoundError,
  AddressNameTooLongError,
  DuplicateAddressNameError,
  InvalidIcpAddressError,
  InvalidIcrc1AddressError,
  TooManyNamedAddressesError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AddressBook,
  NamedAddress,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { getAuthenticatedIdentity } from "$lib/services/auth.services";
import { queryAndUpdate } from "$lib/services/utils.services";
import { addressBookStore } from "$lib/stores/address-book.store";
import { startBusy, stopBusy } from "$lib/stores/busy.store";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import { isLastCall } from "$lib/utils/env.utils";
import { isNullish } from "@dfinity/utils";
import { get } from "svelte/store";

/**
 * Load address book from the `nns-dapp` backend and update the `addressBookStore` store.
 * - Displays an error toast if the operation fails.
 */
export const loadAddressBook = async ({
  ignoreAccountNotFoundError,
}: {
  ignoreAccountNotFoundError?: boolean;
} = {}) => {
  return queryAndUpdate<AddressBook, unknown>({
    request: (options) => getAddressBook(options),
    strategy: "query_and_update",
    onLoad: ({ response: { named_addresses: namedAddresses }, certified }) => {
      addressBookStore.set({
        namedAddresses,
        certified,
      });
    },
    onError: ({ error: err, certified, strategy }) => {
      console.error(err);

      if (ignoreAccountNotFoundError && err instanceof AccountNotFoundError) {
        // When you log in with a new account for the first time, the account is created in the NNS dapp.
        // If you request address book before the account is created, an `AccountNotFound` error will be thrown.
        // In this case, we can be sure that the user has no address book entries.
        addressBookStore.set({
          namedAddresses: [],
          certified,
        });
        return;
      }

      if (!isLastCall({ strategy, certified })) {
        return;
      }

      // Explicitly handle only UPDATE errors
      addressBookStore.reset();

      toastsError({
        labelKey: "error__address_book.load_address_book",
        err,
      });
    },
    logMessage: "Get Address Book",
  });
};

/**
 * Save address book to the nns-dapp backend.
 * Returns an error if the operation fails.
 */
const saveAddressBook = async ({
  namedAddresses,
}: {
  namedAddresses: NamedAddress[];
}): Promise<{ err: Error | undefined }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await setAddressBook({ identity, namedAddresses });
  } catch (err) {
    return { err: err as Error };
  }

  return { err: undefined };
};

/**
 * Add new named address and reload address book from the `nns-dapp` backend to update the `addressBookStore`.
 * - Displays a success toast if the operation is successful.
 * - Displays an error toast if the operation fails.
 */
export const addNamedAddress = async ({
  addressToAdd,
  namedAddresses,
}: {
  addressToAdd: NamedAddress;
  namedAddresses: NamedAddress[];
}): Promise<{ success: boolean }> => {
  const addresses = [...namedAddresses, addressToAdd];
  const { err } = await saveAddressBook({ namedAddresses: addresses });

  if (isNullish(err)) {
    await loadAddressBook();
    toastsSuccess({
      labelKey: "address_book.add_address_success",
    });

    return { success: true };
  }

  if (err instanceof TooManyNamedAddressesError) {
    toastsError({
      labelKey: "error__address_book.too_many",
      err,
    });
  } else if (err instanceof InvalidIcpAddressError) {
    toastsError({
      labelKey: "error__address_book.invalid_icp",
      err,
    });
  } else if (err instanceof InvalidIcrc1AddressError) {
    toastsError({
      labelKey: "error__address_book.invalid_icrc1",
      err,
    });
  } else if (err instanceof AddressNameTooLongError) {
    toastsError({
      labelKey: "error__address_book.name_too_long",
      err,
    });
  } else if (err instanceof DuplicateAddressNameError) {
    toastsError({
      labelKey: "error__address_book.duplicate_name",
      err,
    });
  } else {
    toastsError({
      labelKey: "error__address_book.add_address",
      err,
    });
  }

  return { success: false };
};

/**
 * Update a named address and reload address book from the `nns-dapp` backend to update the `addressBookStore`.
 * - Displays a success toast if the operation is successful.
 * - Displays an error toast if the operation fails.
 */
export const updateNamedAddress = async ({
  oldName,
  updatedAddress,
  namedAddresses,
}: {
  oldName: string;
  updatedAddress: NamedAddress;
  namedAddresses: NamedAddress[];
}): Promise<{ success: boolean }> => {
  const addresses = namedAddresses.map((address) =>
    address.name === oldName ? updatedAddress : address
  );

  const { err } = await saveAddressBook({ namedAddresses: addresses });

  if (isNullish(err)) {
    await loadAddressBook();
    toastsSuccess({
      labelKey: "address_book.update_address_success",
    });

    return { success: true };
  }

  if (err instanceof InvalidIcpAddressError) {
    toastsError({
      labelKey: "error__address_book.invalid_icp",
      err,
    });
  } else if (err instanceof InvalidIcrc1AddressError) {
    toastsError({
      labelKey: "error__address_book.invalid_icrc1",
      err,
    });
  } else if (err instanceof AddressNameTooLongError) {
    toastsError({
      labelKey: "error__address_book.name_too_long",
      err,
    });
  } else if (err instanceof DuplicateAddressNameError) {
    toastsError({
      labelKey: "error__address_book.duplicate_name",
      err,
    });
  } else {
    toastsError({
      labelKey: "error__address_book.update_address",
      err,
    });
  }

  return { success: false };
};

/**
 * Remove a named address and reload address book from the `nns-dapp` backend to update the `addressBookStore`.
 * - Displays a success toast if the operation is successful.
 * - Displays an error toast if the operation fails.
 */
export const removeNamedAddress = async (
  name: string
): Promise<{ success: boolean }> => {
  try {
    startBusy({
      initiator: "address-book-removing",
      labelKey: "address_book.removing",
    });

    const remainingAddresses = (
      get(addressBookStore).namedAddresses ?? []
    ).filter((address) => address.name !== name);

    const { err } = await saveAddressBook({
      namedAddresses: remainingAddresses,
    });

    if (isNullish(err)) {
      // There is no need to reload address book if the remove operation is successful.
      addressBookStore.remove(name);

      toastsSuccess({
        labelKey: "address_book.remove_address_success",
      });

      return { success: true };
    }

    toastsError({
      labelKey: "error__address_book.remove_address",
      err,
    });

    return { success: false };
  } finally {
    stopBusy("address-book-removing");
  }
};
