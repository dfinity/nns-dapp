import { createSwapCanisterAccountsStore } from "$lib/derived/sns-swap-canisters-accounts.derived";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { getSwapCanisterAccount } from "$lib/utils/sns.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { get } from "svelte/store";

describe("sns swap canisters accounts store", () => {
  const swapCanisterId = principal(0);
  const aggregatorData = {
    ...aggregatorSnsMockDto,
    canister_ids: {
      ...aggregatorSnsMockDto.canister_ids,
      swap_canister_id: swapCanisterId.toText(),
    },
  };

  beforeEach(() => {
    snsAggregatorStore.reset();
  });

  it("should convert swap canisters to accounts for a given controller", () => {
    snsAggregatorStore.setData([aggregatorData]);

    const controller = mockPrincipal;
    const store = createSwapCanisterAccountsStore(controller);

    expect(get(store)).toEqual(
      new Set([getSwapCanisterAccount({ controller, swapCanisterId }).toHex()])
    );
  });

  it("should return empty array if no aggregator data", () => {
    const controller = mockPrincipal;
    const store = createSwapCanisterAccountsStore(controller);

    expect(get(store)).toEqual(new Set());
  });

  it("should empty array if no controller", () => {
    snsAggregatorStore.setData([aggregatorData]);

    const store = createSwapCanisterAccountsStore(undefined);

    expect(get(store)).toEqual(new Set());
  });

  it("should convert multiple swap canister ids to accounts", () => {
    const swapCanisterId2 = principal(1);
    const aggregatorData2 = {
      ...aggregatorSnsMockDto,
      canister_ids: {
        ...aggregatorSnsMockDto.canister_ids,
        swap_canister_id: swapCanisterId2.toText(),
      },
    };
    snsAggregatorStore.setData([aggregatorData, aggregatorData2]);

    const controller = mockPrincipal;
    const store = createSwapCanisterAccountsStore(controller);

    expect(get(store)).toEqual(
      new Set([
        getSwapCanisterAccount({ controller, swapCanisterId }).toHex(),
        getSwapCanisterAccount({
          controller,
          swapCanisterId: swapCanisterId2,
        }).toHex(),
      ])
    );
  });
});
