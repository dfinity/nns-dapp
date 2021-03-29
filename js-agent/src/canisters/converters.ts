import BigNumber from "bignumber.js";
import { Option } from "./option";

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

export const arrayBufferToBigInt = (buffer: ArrayBuffer) : bigint => {
    const view = new DataView(buffer);
    return view.getBigUint64(0);
}

export const arrayBufferToArrayOfNumber = (buffer: ArrayBuffer) : Array<number> => {
    const typedArray = new Uint8Array(buffer);
    return Array.from(typedArray);
}

export const arrayOfNumberToArrayBuffer = (numbers: Array<number>) : ArrayBuffer => {
    return new Uint8Array(numbers);
}

export function bigintToArrayBuffer(bi: bigint) {
    let hex = bi.toString(16);
    if (hex.length % 2) { 
        hex = '0' + hex; 
    }

    const len = hex.length / 2;
    const u8 = new Uint8Array(len);

    let i = 0;
    let j = 0;   
    while (i < len) {
        u8[i] = parseInt(hex.slice(j, j+2), 16);
        i += 1;
        j += 2;
    }

    return u8;
}

export function asciiStringToByteArray(text: string) : Array<number> {
    return Array
        .from(text)
        .map(c => c.charCodeAt(0));
}