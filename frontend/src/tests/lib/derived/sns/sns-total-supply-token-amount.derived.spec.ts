import { snsTotalSupplyTokenAmountStore } from "$lib/derived/sns/sns-total-supply-token-amount.derived";
import { snsTotalTokenSupplyStore } from "$lib/stores/sns-total-token-supply.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { snsResponsesForLifecycle } from "$tests/mocks/sns-response.mock";
import { TokenAmount } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { get } from "svelte/store";

describe("snsTotalSupplyTokenAmountStore", () => {
  beforeEach(() => {
    snsQueryStore.reset();
    snsTotalTokenSupplyStore.reset();
  });
  it("should return the total supply of tokens for each SNS in TokenAmount", () => {
    const responses = snsResponsesForLifecycle({
      certified: true,
      lifecycles: [
        SnsSwapLifecycle.Committed,
        SnsSwapLifecycle.Open,
        SnsSwapLifecycle.Open,
      ],
    });
    const rootCanisterIds = responses[0].map(({ rootCanisterId }) =>
      Principal.fromText(rootCanisterId)
    );
    snsQueryStore.setData(responses);
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
