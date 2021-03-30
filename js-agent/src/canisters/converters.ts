import BigNumber from "bignumber.js";
import { ICPTs } from "./ledger/model";
import { ICPTs as RawICPTs } from "./ledger/rawService";

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

export function asciiStringToByteArray(text: string) : Array<number> {
    return Array
        .from(text)
        .map(c => c.charCodeAt(0));
}

export function toICPTs(value: RawICPTs) : ICPTs {
    return {
        doms: BigInt(value.doms)
    };
}