import { SUB_ACCOUNT_BYTE_LENGTH } from "./constants";
import { BinaryBlob, blobFromUint8Array, Principal } from "@dfinity/agent";
import { Buffer } from "buffer";
import { sha224 } from "@dfinity/agent/lib/cjs/utils/sha224";
import crc from "crc";
import { AccountIdentifier } from "./common/types";

export const uint8ArrayToBigInt = (array: Uint8Array) : bigint => {
    const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    if (typeof view.getBigUint64 === "function") {
        return view.getBigUint64(0);
    } else {
        const high = BigInt(view.getUint32(0));
        const low = BigInt(view.getUint32(4));

        return (high << BigInt(32)) + low;
    }
}

const TWO_TO_THE_32 = BigInt(1) << BigInt(32);
export const bigIntToUint8Array = (value: bigint) : Uint8Array => {
    const array = new Uint8Array(8);
    const view = new DataView(array.buffer, array.byteOffset, array.byteLength);
    if (typeof view.getBigUint64 === "function") {
        view.setBigUint64(0, value);
    } else {
        view.setUint32(0, Number(value >> BigInt(32)));
        view.setUint32(4, Number(value % TWO_TO_THE_32));
    }

    return array;
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
    return Uint8Array.from(Buffer.from(accountIdentifier, "hex")).subarray(4);
}

export const accountIdentifierFromBytes = (accountIdentifier: Uint8Array) : AccountIdentifier => {
    return Buffer.from(accountIdentifier).toString("hex");
}

export const principalToAccountIdentifier = (principal: Principal, subAccount?: Uint8Array) : string => {
    // Hash (sha224) the principal, the subAccount and some padding
    const padding = asciiStringToByteArray("\x0Aaccount-id");
    const array = new Uint8Array([
        ...padding,
        ...principal.toBlob(),
        ...(subAccount ?? Array(32).fill(0))]);
    const hash = sha224(array);

    // Prepend the checksum of the hash and convert to a hex string
    const checksum = calculateCrc32(hash);
    const array2 = new Uint8Array([
        ...checksum,
        ...hash
    ]);
    return blobFromUint8Array(array2).toString("hex");
}

// 4 bytes
function calculateCrc32(bytes: BinaryBlob) : Uint8Array {
    const checksumArrayBuf = new ArrayBuffer(4);
    const view = new DataView(checksumArrayBuf);
    view.setUint32(0, crc.crc32(Buffer.from(bytes)), false);
    return Buffer.from(checksumArrayBuf);
}
