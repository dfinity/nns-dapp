import { snsTotalTokenSupplyStore } from "$lib/derived/sns-total-token-supply.derived";
import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { TokenAmountV2 } from "@dfinity/utils";
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
    const totalSupplyBase = 10_000_000_000n;
    const totalSupplies = rootCanisterIds.map((rootCanisterId, index) => ({
      rootCanisterId,
      totalSupply: totalSupplyBase * BigInt(index + 1),
      certified: true,
    }));
    snsTotalTokenSupplyStore.setTotalTokenSupplies(totalSupplies);

    const store = get(snsTotalSupplyTokenAmountStore);

    for (let i = 0; i < rootCanisterIds.length; i++) {
      const oneTotalSupply = store[rootCanisterIds[i].toText()];
      expect(oneTotalSupply).toBeInstanceOf(TokenAmountV2);
      expect(oneTotalSupply.toUlps()).toEqual(totalSupplies[i].totalSupply);
    }
  });
});
