import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import type { CkBtcMinterDid } from "@icp-sdk/canisters/ckbtc";

export const mockUpdateBalanceOk = [
  {
    Checked: {
      height: 123,
      value: 123n,
      outpoint: { txid: arrayOfNumberToUint8Array([0, 0, 1]), vout: 123 },
    },
  },
];

export const mockCkBTCMinterInfo: CkBtcMinterDid.MinterInfo = {
  retrieve_btc_min_amount: 1n,
  deposit_btc_min_amount: [],
  min_confirmations: 12,
  kyt_fee: 3n,
};
