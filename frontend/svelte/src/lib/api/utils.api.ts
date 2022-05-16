import type { SubAccountArray } from "../canisters/nns-dapp/nns-dapp.types";

const arrayBufferToNumber = (buffer: ArrayBuffer): number => {
  const view = new DataView(buffer);
  return view.getUint32(view.byteLength - 4);
};

/**
 * Converts a subAccount from NNS Dapp canister to the type that nns-js needs.
 * as in ts/src/canisters/converters.ts
 *
 * @param subAccount Array<number> from SubAccountArray type in nns-dapp canister
 * @returns subAccountId that `ledgerCanister` from nns-js requires.
 */
export const toSubAccountId = (subAccount: SubAccountArray): number => {
  const bytes = new Uint8Array(subAccount).buffer;
  return arrayBufferToNumber(bytes);
};
