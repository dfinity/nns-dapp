import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import { IMPORTANT_CK_TOKEN_IDS } from "$lib/constants/important-ck-tokens.constants";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import type { Principal } from "@dfinity/principal";
import { fromNullable, nonNullish, toNullable } from "@dfinity/utils";

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

// TODO: unit test me!
export const isImportedToken = ({
  ledgerCanisterId,
  importedTokens,
}: {
  ledgerCanisterId: Principal | undefined;
  importedTokens: ImportedTokenData[] | undefined;
}): boolean =>
  nonNullish(ledgerCanisterId) &&
  nonNullish(importedTokens) &&
  importedTokens.some(
    ({ ledgerCanisterId: id }) => id.toText() === ledgerCanisterId.toText()
  );

export const isUniqueImportedToken = ({
  ledgerCanisterId,
  importedTokens,
}: {
  ledgerCanisterId: Principal;
  importedTokens: ImportedTokenData[] | undefined;
}): boolean =>
  nonNullish(importedTokens) &&
  importedTokens.every(
    ({ ledgerCanisterId: id }) => id.toText() !== ledgerCanisterId.toText()
  );

export const isImportantCkToken = ({
  ledgerCanisterId,
}: {
  ledgerCanisterId: Principal;
}): boolean =>
  IMPORTANT_CK_TOKEN_IDS.some(
    (token) => token.toText() === ledgerCanisterId.toText()
  );
