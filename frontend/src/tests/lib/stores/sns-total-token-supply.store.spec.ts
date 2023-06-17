import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("SNS Total Tokens Supply store", () => {
  beforeEach(() => snsTotalTokenSupplyStore.reset());

  const totalSupplyData = {
    totalSupply: BigInt(1000_000_000),
    certified: true,
  };

  it("should set supply data on one project", () => {
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore).toEqual({});

    const rootCanisterId = mockCanisterId;

    snsTotalTokenSupplyStore.setTotalTokenSupplies([
      {
        rootCanisterId,
        ...totalSupplyData,
      },
    ]);

    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()]).toEqual(totalSupplyData);
  });

  it("should set supply data without affecting other projects", () => {
    const rootCanisterId = principal(0);
    snsTotalTokenSupplyStore.setTotalTokenSupplies([
      {
        rootCanisterId,
        ...totalSupplyData,
      },
    ]);
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore[rootCanisterId.toText()]).toEqual(totalSupplyData);

    const rootCanisterId2 = principal(1);
    snsTotalTokenSupplyStore.setTotalTokenSupplies([
      {
        rootCanisterId: rootCanisterId2,
        ...totalSupplyData,
      },
    ]);
    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()]).toEqual(totalSupplyData);
    expect(store[rootCanisterId2.toText()]).toEqual(totalSupplyData);
  });

  it("should override supply data on the same project", () => {
    const rootCanisterId = principal(0);
    snsTotalTokenSupplyStore.setTotalTokenSupplies([
      {
        rootCanisterId,
        ...totalSupplyData,
      },
    ]);
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore[rootCanisterId.toText()].totalSupply).toEqual(
      totalSupplyData.totalSupply
    );

    const newSupply = BigInt(2000_000_000);
    snsTotalTokenSupplyStore.setTotalTokenSupplies([
      {
        rootCanisterId,
        totalSupply: newSupply,
        certified: true,
      },
    ]);
    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()].totalSupply).toEqual(newSupply);
  });
});
