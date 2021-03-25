import BigNumber from "bignumber.js";

export const toBigNumber = (value: bigint) : BigNumber => {
    return new BigNumber(value.toString(10));
}

export const fromBigNumber = (value: BigNumber) : bigint => {
    return BigInt(value.toString(10));
}
