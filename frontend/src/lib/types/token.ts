/**
 * A token abstraction for NNS-dapp.
 *
 * - The Nns token metadata are currently provided as constant.
 *
 * - Icrc Token metadata are to some extension optional and provided in Candid in a way the frontend cannot really use.
 *   That's why we map these data.
 *
 *   See IcrcMetadataResponseEntries in @dfinity/ledger
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  logo?: string;
}
