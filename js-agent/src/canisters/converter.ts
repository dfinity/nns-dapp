import BigNumber from "bignumber.js";
import { SUB_ACCOUNT_BYTE_LENGTH } from "./constants";
import { BinaryBlob } from "@dfinity/agent";
import { Buffer } from "buffer";
import { AccountIdentifier } from "./ledger/model";

export const bigIntToBigNumber = (value: bigint) : BigNumber => {
    return new BigNumber(value.toString(10));
}

export const bigNumberToBigInt = (value: BigNumber) : bigint => {
    return BigInt(value.toString(10));
}

export const arrayBufferToBigNumber = (buffer: ArrayBuffer) : BigNumber => {
    const view = new DataView(buffer);
    const value = view.getBigUint64(0);
    return bigIntToBigNumber(value);
}

export const uint8ArrayToBigInt = (array: Uint8Array) : bigint => {
    const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    return view.getBigUint64(0);
}

export const arrayBufferToArrayOfNumber = (buffer: ArrayBuffer) : Array<number> => {
    const typedArray = new Uint8Array(buffer);
    return Array.from(typedArray);
}

export const arrayOfNumberToUint8Array = (numbers: Array<number>) : Uint8Array => {
    return new Uint8Array(numbers);
}

export const arrayOfNumberToArrayBuffer = (numbers: Array<number>) : ArrayBuffer => {
    return arrayOfNumberToUint8Array(numbers).buffer;
}

export const arrayBufferToNumber = (buffer: ArrayBuffer) : number => {
    const view = new DataView(buffer);
    return view.getUint32(view.byteLength - 4);
}

export const numberToArrayBuffer = (value: number, byteLength: number) : ArrayBuffer => {
    const buffer = new ArrayBuffer(byteLength);
    new DataView(buffer).setUint32(byteLength - 4, value);
    return buffer;
}

export const asciiStringToByteArray = (text: string) : Array<number> => {
    return Array
        .from(text)
        .map(c => c.charCodeAt(0));
}

export const toSubAccountId = (subAccount: Array<number>) : number => {
    const bytes = arrayOfNumberToArrayBuffer(subAccount);
    return arrayBufferToNumber(bytes);
}

export const fromSubAccountId = (subAccountId: number) : Array<number> => {
    const buffer = numberToArrayBuffer(subAccountId, SUB_ACCOUNT_BYTE_LENGTH);
    return arrayBufferToArrayOfNumber(buffer);
}

export const uint8ArrayToBlob = (array: Uint8Array) : BinaryBlob => {
    return Buffer.from(array) as unknown as BinaryBlob;
}

export const blobToUint8Array = (blob: BinaryBlob) : Uint8Array => {
    return Buffer.from(blob);
}

export const accountIdentifierToBytes = (accountIdentifier: AccountIdentifier) : Uint8Array => {
    return Uint8Array.from(Buffer.from(accountIdentifier, "hex"));
}

export const accountIdentifierFromBytes = (accountIdentifier: Uint8Array) : AccountIdentifier => {
    return Buffer.from(accountIdentifier).toString("hex");
}