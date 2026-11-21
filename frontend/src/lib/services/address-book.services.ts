import { getAddressBook, setAddressBook } from "$lib/api/address-book.api";
import {
  AccountNotFoundError,
  AddressNameTooLongError,
  AddressNameTooShortError,
  DuplicateAddressNameError,
  InvalidIcpAddressError,
  InvalidIcrc1AddressError,
  TooManyNamedAddressesError,
} from "$lib/canisters/nns-dapp/nns-dapp.errors";
import type {
  AddressBook,
  NamedAddress,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { FORCE_CALL_STRATEGY } from "$lib/constants/mockable.constants";
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
    request: getAddressBook,
    strategy: FORCE_CALL_STRATEGY,
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

export type AddressBookMutation =
  | { type: "add"; address: NamedAddress }
  | { type: "update"; previousName: string; address: NamedAddress }
  | { type: "remove"; name: string };

const normalizeName = (name: string): string => name.trim().toLowerCase();

const applyMutation = ({
  namedAddresses,
  mutation,
}: {
  namedAddresses: NamedAddress[];
  mutation: AddressBookMutation;
}): NamedAddress[] => {
  switch (mutation.type) {
    case "add":
      return [...namedAddresses, mutation.address];
    case "update": {
      const previousName = normalizeName(mutation.previousName);
      const addressExists = namedAddresses.some(
        ({ name }) => normalizeName(name) === previousName
      );
      if (!addressExists) {
        throw new Error("The address book entry no longer exists.");
      }
      return namedAddresses.map((address) =>
        normalizeName(address.name) === previousName
          ? mutation.address
          : address
      );
    }
    case "remove": {
      const addresses = namedAddresses.filter(
        ({ name }) => name !== mutation.name
      );
      if (addresses.length === namedAddresses.length) {
        throw new Error("The address book entry no longer exists.");
      }
      return addresses;
    }
  }
};

/**
 * Applies one mutation to a certified address book and reloads the store.
 * Uncertified store data is never used as the base of the backend write.
 */
export const saveAddressBook = async (
  mutation: AddressBookMutation
): Promise<{ err?: Error } | undefined> => {
  try {
    const identity = await getAuthenticatedIdentity();
    const { named_addresses: certifiedAddresses } = await getAddressBook({
      identity,
      certified: true,
    });
    const namedAddresses = applyMutation({
      namedAddresses: certifiedAddresses,
      mutation,
    });
    await setAddressBook({ identity, namedAddresses });
    await loadAddressBook();
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
    } else if (error instanceof AddressNameTooShortError) {
      toastsError({
        labelKey: "error__address_book.name_too_short",
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
