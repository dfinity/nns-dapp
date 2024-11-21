import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { NNS_TOKEN_DATA } from "$lib/constants/tokens.constants";
import {
  mainTransactionFeeE8sStore,
  mainTransactionFeeStoreAsToken,
} from "$lib/derived/main-transaction-fee.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("mainTransactionFeeStoreAsToken", () => {
  it("should return transaction fee as token", () => {
    const value = get(mainTransactionFeeStoreAsToken);
    expect(value instanceof TokenAmount).toBeTruthy();
  });

  it("should set ICP fee value as bigint", () => {
    expect(get(mainTransactionFeeE8sStore)).toBe(NNS_TOKEN_DATA.fee);

    const newFee = 40_000n;
    tokensStore.setToken({
      canisterId: OWN_CANISTER_ID,
      token: {
        ...NNS_TOKEN_DATA,
        fee: newFee,
      },
      certified: true,
    });
    expect(get(mainTransactionFeeE8sStore)).toBe(newFee);
  });
});
