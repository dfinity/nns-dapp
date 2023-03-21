import { arrayOfNumberToUint8Array } from "@dfinity/utils";

export const mockUpdateBalanceOk = [
  {
    Checked: {
      height: 123,
      value: 123n,
      outpoint: { txid: arrayOfNumberToUint8Array([0, 0, 1]), vout: 123 },
    },
  },
];
