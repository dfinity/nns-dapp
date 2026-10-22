import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { isImportantCkToken } from "$lib/utils/icrc-tokens.utils";
import { fromNullable, nonNullish, toNullable } from "@dfinity/utils";
import type { Principal } from "@icp-sdk/core/principal";

/**
 * Tell if the imported tokens in the store come from a certified call.
 *
 * Only an update call gives certified data. A query response is never
 * certified, whatever call strategy the session uses.
 */
export const isImportedTokensCertified = (
  certified: boolean | undefined
): boolean => certified === true;

export const toImportedTokenData = ({
  ledger_canister_id,
  index_canister_id,
}: ImportedToken): ImportedTokenData => ({
  ledgerCanisterId: ledger_canister_id,
  indexCanisterId: fromNullable(index_canister_id),
});

export const fromImportedTokenData = ({
  ledgerCanisterId,
  indexCanisterId,
}: ImportedTokenData): ImportedToken => ({
  ledger_canister_id: ledgerCanisterId,
  index_canister_id: toNullable(indexCanisterId),
});

export const isImportedToken = ({
  ledgerCanisterId,
  importedTokens,
  filterOutImportantCkToken = true,
}: {
  ledgerCanisterId: Principal | undefined;
  importedTokens: ImportedTokenData[] | undefined;
  filterOutImportantCkToken?: boolean;
}): boolean =>
  nonNullish(ledgerCanisterId) &&
  nonNullish(importedTokens) &&
  importedTokens.some(
    ({ ledgerCanisterId: id }) => id.toText() === ledgerCanisterId.toText()
  ) &&
  (!filterOutImportantCkToken || !isImportantCkToken({ ledgerCanisterId }));
