import type {
  AccountIdentifierString,
  Transaction,
} from "$lib/canisters/nns-dapp/nns-dapp.types";
import { hashCode, logWithTimestamp } from "$lib/utils/dev.utils";
import type { Identity } from "@dfinity/agent";
import { nnsDappCanister } from "./nns-dapp.api";

export const createSubAccount = async ({
  name,
  identity,
}: {
  name: string;
  identity: Identity;
}): Promise<void> => {
  logWithTimestamp(`Creating SubAccount ${hashCode(name)} call...`);

  const { canister } = await nnsDappCanister({ identity });

  await canister.createSubAccount({
    subAccountName: name,
  });

  logWithTimestamp(`Creating SubAccount ${hashCode(name)} complete.`);
};

export const getTransactions = async ({
  identity,
  accountIdentifier,
  pageSize,
  offset,
  certified,
}: {
  identity: Identity;
  accountIdentifier: AccountIdentifierString;
  pageSize: number;
  offset: number;
  certified: boolean;
}): Promise<Transaction[]> => {
  logWithTimestamp(
    `Loading Transactions ${hashCode(accountIdentifier)} call...`
  );

  const { canister } = await nnsDappCanister({ identity });

  const { transactions } = await canister.getTransactions({
    accountIdentifier,
    pageSize,
    offset,
    certified,
  });

  logWithTimestamp(
    `Loading Transactions ${hashCode(accountIdentifier)} complete.`
  );

  return transactions;
};

export const renameSubAccount = async ({
  newName,
  identity,
  subAccountIdentifier,
}: {
  newName: string;
  identity: Identity;
  subAccountIdentifier: AccountIdentifierString;
}): Promise<void> => {
  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subAccountIdentifier)} call...`
  );

  const { canister } = await nnsDappCanister({ identity });

  await canister.renameSubAccount({
    new_name: newName,
    account_identifier: subAccountIdentifier,
  });

  logWithTimestamp(
    `Renaming SubAccount ${hashCode(subAccountIdentifier)} complete.`
  );
};
