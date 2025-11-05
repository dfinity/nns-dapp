import { nnsDappCanister } from "$lib/api/nns-dapp.api";
import type {
  AddressBook,
  NamedAddress,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";

export const getAddressBook = async ({
  identity,
  certified,
}: {
  identity: Identity;
  certified: boolean;
}): Promise<AddressBook> => {
  logWithTimestamp(`Getting address book:${certified} call...`);

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  const response = await nnsDapp.getAddressBook({ certified });

  logWithTimestamp(`Getting address book call:${certified} complete`);

  return response;
};

export const setAddressBook = async ({
  identity,
  namedAddresses,
}: {
  identity: Identity;
  namedAddresses: Array<NamedAddress>;
}): Promise<void> => {
  logWithTimestamp("Setting address book call...");

  const { canister: nnsDapp } = await nnsDappCanister({ identity });
  await nnsDapp.setAddressBook(namedAddresses);

  logWithTimestamp("Setting address book call complete.");
};
