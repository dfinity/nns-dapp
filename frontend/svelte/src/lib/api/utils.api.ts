import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";

// Source: as in ts/src/canisters/converters.ts
export const arrayOfNumberToUint8Array = (
  numbers: Array<number>
): Uint8Array => {
  return new Uint8Array(numbers);
};

export const arrayOfNumberToArrayBuffer = (
  numbers: Array<number>
): ArrayBuffer => {
  return arrayOfNumberToUint8Array(numbers).buffer;
};

export const arrayBufferToNumber = (buffer: ArrayBuffer): number => {
  const view = new DataView(buffer);
  return view.getUint32(view.byteLength - 4);
};

/**
 * Converts a subAccount from NNS Dapp canister to the type that nns-js needs.
 *
 * @param subAccount Array<number> from SubAccountArray type in nns-dapp canister
 * @returns subAccountId that `ledgerCanister` from nns-js requires.
 */
export const toSubAccountId = (subAccount: SubAccountArray): number => {
  const bytes = arrayOfNumberToArrayBuffer(subAccount);
  return arrayBufferToNumber(bytes);
};
