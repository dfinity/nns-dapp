export enum LedgerConnectionState {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
  INCORRECT_DEVICE,
}

// Return codes of the Ledger device.
// `@zondax/ledger-js` 0.2 declares `LedgerError` as a const enum with no runtime value, so the codes in use are defined here.
export enum LedgerError {
  NoErrors = 0x9000,
  WrongLength = 0x6700,
  TransactionRejected = 0x6986,
  UnknownError = 0x6f00,
}

// Errors throw by Ledger device but not defined in LedgerError (https://github.com/zondax/ledger-icp)
export enum ExtendedLedgerError {
  AppNotOpen = 28161,
  CannotFetchPublicKey = 65535,
}
// In TypeScript enum cannot be extended yet
export type AllLedgerError = LedgerError | ExtendedLedgerError;

export const LEDGER_SIGNATURE_LENGTH = 64;
export const LEDGER_DEFAULT_DERIVE_PATH = `m/44'/223'/0'/0/0`;
