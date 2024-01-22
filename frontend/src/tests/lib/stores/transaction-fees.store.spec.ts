import { DEFAULT_TRANSACTION_FEE_E8S } from "$lib/constants/icp.constants";
import { tokensStore } from "$lib/stores/tokens.store";
import {
  mainTransactionFeeStore,
  transactionsFeesStore,
} from "$lib/stores/transaction-fees.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("transactionsFeesStore", () => {
  beforeEach(() => {
    transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
    tokensStore.reset();
  });
  it("should set it to default transaction fee", () => {
    const { main } = get(transactionsFeesStore);
    expect(main).toEqual(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
  });

  it("should set main value", () => {
    const newFee = 40_000;
    const fee = get(mainTransactionFeeStore);
    expect(fee).toBe(newFee);
  });

  it("should reset to default", () => {
    transactionsFeesStore.setMain(40_000n);
    const fee1 = get(transactionsFeesStore);
    transactionsFeesStore.setMain(BigInt(DEFAULT_TRANSACTION_FEE_E8S));
    const fee2 = get(transactionsFeesStore);
    expect(fee1.main).not.toEqual(fee2);
  });

  it("should set fee of an sns project", () => {
    transactionsFeesStore.setFee({
      rootCanisterId: mockPrincipal,
      fee: 40_000n,
      certified: true,
    });
    const store1 = get(transactionsFeesStore);
    const { fee: fee1 } = store1.projects[mockPrincipal.toText()];

    const expectedFee = 50_000n;
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

  it("should set fee of multiple sns projects", () => {
    const rootCanister2 = Principal.fromText("aaaaa-aa");
    const expectedFee1 = 40_000n;
    const expectedFee2 = 50_000n;
    transactionsFeesStore.setFees([
      {
        rootCanisterId: mockPrincipal,
        fee: expectedFee1,
        certified: true,
      },
      {
        rootCanisterId: rootCanister2,
        fee: expectedFee2,
        certified: true,
      },
    ]);
    const store1 = get(transactionsFeesStore);
    const { fee: fee1 } = store1.projects[mockPrincipal.toText()];
    const { fee: fee2 } = store1.projects[rootCanister2.toText()];

    expect(fee1).toEqual(expectedFee1);
    expect(fee2).toEqual(expectedFee2);
  });
});
