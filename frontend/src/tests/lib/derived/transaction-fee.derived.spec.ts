import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
import { tokensStore } from "$lib/stores/tokens.store";
import { TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("mainTransactionFeeStoreAsToken", () => {
  beforeEach(() => {
    tokensStore.reset();
  });
  it("should return transaction fee as token", () => {
    const value = get(mainTransactionFeeStoreAsToken);
    expect(value instanceof TokenAmount).toBeTruthy();
  });
});
