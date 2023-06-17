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

export const mockCkBTCMinterInfo = {
  retrieve_btc_min_amount: 1n,
  min_confirmations: 12,
  kyt_fee: 3n,
};
