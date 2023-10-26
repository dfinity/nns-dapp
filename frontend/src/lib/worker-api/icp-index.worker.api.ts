import type { AccountIdentifierString } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { DEFAULT_TRANSACTIONS_INDEX_PAGE_LIMIT } from "$lib/constants/constants";
import { DEV } from "$lib/constants/mockable.constants";
import type { Identity } from "@dfinity/agent";
import type { GetAccountIdentifierTransactionsResponse } from "@junobuild/ledger";
import { balance, transactions } from "@junobuild/ledger";

export const getBalance = (
  {
    accountIdentifier,
    identity,
  }: {
    accountIdentifier: AccountIdentifierString;
    identity: Identity;
  }
): Promise<bigint> =>
  balance({
    index: {
      ...(DEV && { env: "dev" }),
      identity,
    },
    accountIdentifier,
  });

export const getTransactions = (
  {
    accountIdentifier,
    identity,
    start,
    maxResults = DEFAULT_TRANSACTIONS_INDEX_PAGE_LIMIT,
  }: {
    accountIdentifier: AccountIdentifierString;
    identity: Identity;
    start?: bigint;
    maxResults?: bigint;
  }
): Promise<GetAccountIdentifierTransactionsResponse> =>
  transactions({
    index: {
      ...(DEV && { env: "dev" }),
      identity,
    },
    args: {
      start,
      max_results: maxResults,
      account_identifier: accountIdentifier,
    },
  });
