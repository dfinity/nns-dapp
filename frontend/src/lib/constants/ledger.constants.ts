import type { LedgerError } from "@zondax/ledger-icp";

export enum LedgerConnectionState {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
  INCORRECT_DEVICE,
}

// Errors throw by hardware wallet but not defined in LedgerError (https://github.com/zondax/ledger-icp)
export enum ExtendedLedgerError {
  AppNotOpen = 28161,
  CannotFetchPublicKey = 65535,
}
// In TypeScript enum cannot be extended yet
export type AllLedgerError = LedgerError | ExtendedLedgerError;

export const LEDGER_SIGNATURE_LENGTH = 64;
export const LEDGER_DEFAULT_DERIVE_PATH = `m/44'/223'/0'/0/0`;
