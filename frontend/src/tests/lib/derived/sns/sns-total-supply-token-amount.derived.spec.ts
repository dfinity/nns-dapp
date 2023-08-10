import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmount } from "@dfinity/utils";
import { get } from "svelte/store";

describe("snsTotalSupplyTokenAmountStore", () => {
  beforeEach(() => {
    snsTotalTokenSupplyStore.reset();
  });
  it("should return the total supply of tokens for each SNS in TokenAmount", () => {
    const projectsParams = [
      { rootCanisterId: principal(0), lifecycle: SnsSwapLifecycle.Committed },
      { rootCanisterId: principal(1), lifecycle: SnsSwapLifecycle.Open },
      { rootCanisterId: principal(2), lifecycle: SnsSwapLifecycle.Open },
    ];
    const rootCanisterIds = projectsParams.map(
      ({ rootCanisterId }) => rootCanisterId
    );
    setSnsProjects(projectsParams);
    const totalSupplyBase = BigInt(10_000_000_000);
    const totalSupplies = rootCanisterIds.map((rootCanisterId, index) => ({
      rootCanisterId,
      totalSupply: totalSupplyBase * BigInt(index + 1),
      certified: true,
    }));
    snsTotalTokenSupplyStore.setTotalTokenSupplies(totalSupplies);

    const store = get(snsTotalSupplyTokenAmountStore);

    for (let i = 0; i < rootCanisterIds.length; i++) {
      const oneTotalSupply = store[rootCanisterIds[i].toText()];
      expect(oneTotalSupply).toBeInstanceOf(TokenAmount);
      expect(oneTotalSupply.toE8s()).toEqual(totalSupplies[i].totalSupply);
    }
  });
});
