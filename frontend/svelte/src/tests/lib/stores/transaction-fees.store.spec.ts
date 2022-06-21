import { get } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import {
  mainTransactionFeeStore,
  transactionsFeesStore,
} from "../../../lib/stores/transaction-fees.store";

describe("transactionsFeesStore", () => {
  beforeEach(() =>
    transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S))
  );
  it("should set it to default transaction fee", () => {
    const { main } = get(transactionsFeesStore);
    expect(main).toEqual(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
  });

  it("should set main value", () => {
    const newFee = 40_000;
    transactionsFeesStore.setMain(BigInt(newFee));
    const fee = get(mainTransactionFeeStore);
    expect(fee).toBe(newFee);
  });

  it("should reset to default", () => {
    transactionsFeesStore.setMain(BigInt(40_000));
    const fee1 = get(transactionsFeesStore);
    transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
    const fee2 = get(transactionsFeesStore);
    expect(fee1.main).not.toEqual(fee2);
  });
});
