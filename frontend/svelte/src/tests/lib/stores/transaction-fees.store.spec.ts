import { get } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import {
  mainTransactionFeeNumberStore,
  transactionsFeeStore,
} from "../../../lib/stores/transaction-fees.store";

describe("transactionsFeeStore", () => {
  beforeEach(() => transactionsFeeStore.reset());
  it("should set it to default transaction fee", () => {
    const { main } = get(transactionsFeeStore);
    expect(main).toEqual(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
  });

  it("should set main value", () => {
    const newFee = 40_000;
    transactionsFeeStore.setMain(BigInt(newFee));
    const fee = get(mainTransactionFeeNumberStore);
    expect(fee).toBe(newFee);
  });

  it("should reset to default", () => {
    transactionsFeeStore.setMain(BigInt(40_000));
    const fee1 = get(transactionsFeeStore);
    transactionsFeeStore.reset();
    const fee2 = get(transactionsFeeStore);
    expect(fee1.main).not.toEqual(fee2);
  });
});
