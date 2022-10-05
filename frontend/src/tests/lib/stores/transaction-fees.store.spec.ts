import { get } from "svelte/store";
import { DEFAULT_TRANSACTION_FEE_E8S } from "../../../lib/constants/icp.constants";
import {
  mainTransactionFeeStore,
  transactionsFeesStore,
} from "../../../lib/stores/transaction-fees.store";
import { mockPrincipal } from "../../mocks/auth.store.mock";

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

  it("should set fee of an sns project", () => {
    transactionsFeesStore.setFee({
      rootCanisterId: mockPrincipal,
      fee: BigInt(40_000),
      certified: true,
    });
    const store1 = get(transactionsFeesStore);
    const { fee: fee1 } = store1.projects[mockPrincipal.toText()];

    const expectedFee = BigInt(50_000);
    transactionsFeesStore.setFee({
      rootCanisterId: mockPrincipal,
      fee: expectedFee,
      certified: true,
    });
    const store2 = get(transactionsFeesStore);
    const { fee: fee2 } = store2.projects[mockPrincipal.toText()];

    expect(fee1).not.toEqual(fee2);
    expect(fee2).toEqual(expectedFee);
  });
});
