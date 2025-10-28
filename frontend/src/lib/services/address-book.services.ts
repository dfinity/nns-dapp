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
import { toastsError } from "$lib/stores/toasts.store";
import { isLastCall } from "$lib/utils/env.utils";

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
 * Save the entire address book to the `nns-dapp` backend and reload to update the `addressBookStore`.
 * - This method always saves the complete address book (replaces the existing one).
 * - The UI is responsible for manipulating the array (add/update/remove) before calling this method.
 * - Displays appropriate error toasts based on the error type.
 * - Returns an error if the operation fails.
 */
export const saveAddressBook = async (
  namedAddresses: NamedAddress[]
): Promise<{ err?: Error }> => {
  try {
    const identity = await getAuthenticatedIdentity();
    await setAddressBook({ identity, namedAddresses });
    await loadAddressBook();
    return {};
  } catch (err) {
    const error = err as Error;

    // Display specific error messages based on error type
    // Extract substitutions from the error if it's an AccountTranslateError
    if (error instanceof TooManyNamedAddressesError) {
      toastsError({
        labelKey: "error__address_book.too_many",
        err: error,
        substitutions: error.substitutions,
      });
    } else if (error instanceof InvalidIcpAddressError) {
      toastsError({
        labelKey: "error__address_book.invalid_icp",
        err: error,
        substitutions: error.substitutions,
      });
    } else if (error instanceof InvalidIcrc1AddressError) {
      toastsError({
        labelKey: "error__address_book.invalid_icrc1",
        err: error,
        substitutions: error.substitutions,
      });
    } else if (error instanceof AddressNameTooLongError) {
      toastsError({
        labelKey: "error__address_book.name_too_long",
        err: error,
        substitutions: error.substitutions,
      });
    } else if (error instanceof DuplicateAddressNameError) {
      toastsError({
        labelKey: "error__address_book.duplicate_name",
        err: error,
        substitutions: error.substitutions,
      });
    } else {
      // Generic error message for unexpected errors
      toastsError({
        labelKey: "error__address_book.update_address",
        err: error,
      });
    }

    return { err: error };
  }
};
