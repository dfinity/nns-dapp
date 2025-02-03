import { snsTotalTokenSupplyStore } from "$lib/derived/sns-total-token-supply.derived";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  setProdSnsProjects,
  setSnsProjects,
} from "$tests/utils/sns.test-utils";
import { get } from "svelte/store";

describe("SNS Total Tokens Supply store", () => {
  const totalTokenSupply = 1_000_000_000n;

  const totalSupplyData = {
    totalSupply: totalTokenSupply,
  };

  it("should set supply data on one project", () => {
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore).toEqual({});

    const rootCanisterId = mockCanisterId;

    setSnsProjects([
      {
        rootCanisterId,
        totalTokenSupply,
      },
    ]);

    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()]).toEqual(totalSupplyData);
  });

  it("should set supply data without affecting other projects", () => {
    const rootCanisterId = principal(0);
    const project1 = {
      rootCanisterId,
      totalTokenSupply,
    };
    setSnsProjects([project1]);
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore[rootCanisterId.toText()]).toEqual(totalSupplyData);

    const rootCanisterId2 = principal(1);
    const totalTokenSupply2 = 2n * totalTokenSupply;
    const project2 = {
      rootCanisterId2,
      totalTokenSupply: totalTokenSupply2,
    };
    setSnsProjects([project1, project2]);
    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()]).toEqual(totalSupplyData);
    expect(store[rootCanisterId2.toText()]).toEqual({
      totalSupply: totalTokenSupply2,
    });
  });

  it("should override supply data on the same project", () => {
    const rootCanisterId = principal(0);
    setSnsProjects([
      {
        rootCanisterId,
        totalTokenSupply,
      },
    ]);
    const initialStore = get(snsTotalTokenSupplyStore);
    expect(initialStore[rootCanisterId.toText()].totalSupply).toEqual(
      totalSupplyData.totalSupply
    );

    const newSupply = 2_000_000_000n;
    setSnsProjects([
      {
        rootCanisterId,
        totalTokenSupply: newSupply,
      },
    ]);
    const store = get(snsTotalTokenSupplyStore);
    expect(store[rootCanisterId.toText()].totalSupply).toEqual(newSupply);
  });

  it("should convert prod SNSes without error", async () => {
    await setProdSnsProjects();
    const store = get(snsTotalTokenSupplyStore);
    expect(Object.keys(store).length).toBeGreaterThan(25);
  });
});
