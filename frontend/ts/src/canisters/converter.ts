import { Principal } from "@dfinity/principal";
import { sha224 } from "js-sha256";
import { Buffer } from "buffer";
// @ts-ignore (no type definitions for crc are available)
import crc from "crc";
import { SUB_ACCOUNT_BYTE_LENGTH } from "./constants";
import { AccountIdentifier, SubAccount } from "./common/types";

export const uint8ArrayToBigInt = (array: Uint8Array): bigint => {
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
  if (typeof view.getBigUint64 === "function") {
    return view.getBigUint64(0);
  } else {
    const high = BigInt(view.getUint32(0));
    const low = BigInt(view.getUint32(4));

    return (high << BigInt(32)) + low;
  }
};

const TWO_TO_THE_32 = BigInt(1) << BigInt(32);
export const bigIntToUint8Array = (value: bigint): Uint8Array => {
  const array = new Uint8Array(8);
  const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
  if (typeof view.setBigUint64 === "function") {
    view.setBigUint64(0, value);
  } else {
    view.setUint32(0, Number(value >> BigInt(32)));
    view.setUint32(4, Number(value % TWO_TO_THE_32));
  }

  return array;
};

export const arrayBufferToArrayOfNumber = (
  buffer: ArrayBuffer
): Array<number> => {
  const typedArray = new Uint8Array(buffer);
  return Array.from(typedArray);
};

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

export const numberToArrayBuffer = (
  value: number,
  byteLength: number
): ArrayBuffer => {
  const buffer = new ArrayBuffer(byteLength);
  new DataView(buffer).setUint32(byteLength - 4, value);
  return buffer;
};

export const asciiStringToByteArray = (text: string): Array<number> => {
  return Array.from(text).map((c) => c.charCodeAt(0));
};

export const toSubAccountId = (subAccount: Array<number>): number => {
  const bytes = arrayOfNumberToArrayBuffer(subAccount);
  return arrayBufferToNumber(bytes);
};

export const fromSubAccountId = (subAccountId: number): Array<number> => {
  const buffer = numberToArrayBuffer(subAccountId, SUB_ACCOUNT_BYTE_LENGTH);
  return arrayBufferToArrayOfNumber(buffer);
};

export const accountIdentifierToBytes = (
  accountIdentifier: AccountIdentifier
): Uint8Array => {
  return Uint8Array.from(Buffer.from(accountIdentifier, "hex")).subarray(4);
};

export const accountIdentifierFromBytes = (
  accountIdentifier: Uint8Array
): AccountIdentifier => {
  return Buffer.from(accountIdentifier).toString("hex");
};

export const principalToAccountIdentifier = (
  principal: Principal,
  subAccount?: Uint8Array
): string => {
  // Hash (sha224) the principal, the subAccount and some padding
  const padding = asciiStringToByteArray("\x0Aaccount-id");

  const shaObj = sha224.create();
  shaObj.update([
    ...padding,
    ...principal.toUint8Array(),
    ...(subAccount ?? Array(32).fill(0)),
  ]);
  const hash = new Uint8Array(shaObj.array());

  // Prepend the checksum of the hash and convert to a hex string
  const checksum = calculateCrc32(hash);
  const bytes = new Uint8Array([...checksum, ...hash]);
  return toHexString(bytes);
};

export const principalToSubAccount = (principal: Principal): SubAccount => {
  const bytes = principal.toUint8Array();
  const subAccount = new Uint8Array(32);
  subAccount[0] = bytes.length;
  subAccount.set(bytes, 1);
  return subAccount;
};

const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");

// 4 bytes
export const calculateCrc32 = (bytes: Uint8Array): Uint8Array => {
  const checksumArrayBuf = new ArrayBuffer(4);
  const view = new DataView(checksumArrayBuf);
  view.setUint32(0, crc.crc32(Buffer.from(bytes)), false);
  return Buffer.from(checksumArrayBuf);
};
