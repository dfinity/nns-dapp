import { TokenAmount } from "@dfinity/nns";
import { get } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import { mainTransactionFeeStoreAsToken } from "../../../lib/derived/main-transaction-fee.derived";
import { transactionsFeesStore } from "../../../lib/stores/transaction-fees.store";

describe("mainTransactionFeeStoreAsToken", () => {
  beforeEach(() =>
    transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S))
  );
  it("should return transaction fee as token", () => {
    const value = get(mainTransactionFeeStoreAsToken);
    expect(value instanceof TokenAmount).toBeTruthy();
  });
});
