import type { ImportedToken } from "$lib/canisters/nns-dapp/nns-dapp.types";
import type { ImportedTokenData } from "$lib/types/imported-tokens";
import { fromNullable, toNullable } from "@dfinity/utils";

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
