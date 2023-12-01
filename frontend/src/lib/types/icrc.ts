import type { Token } from "@dfinity/utils";

/**
 * Token metadata are to some extension optional and provided in Candid in a way the frontend cannot really use.
 * That's why we have to map the data as well.
 */
// GIX-2150 Unify `Token` and `IcrcTokenMetadata` types.
export interface IcrcTokenMetadata extends Token {
  fee: bigint;
  decimals?: bigint;
  logo?: string;
  // TODO: integrate "decimals" to replace ICP_DISPLAYED_DECIMALS_DETAILED
}

export type IcrcAccountIdentifierText = string;
