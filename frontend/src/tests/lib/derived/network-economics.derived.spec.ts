import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
} from "$lib/constants/constants";
import {
  clearFollowingAfterSecondsStore,
  startReducingVotingPowerAfterSecondsStore,
} from "$lib/derived/network-economics.derived";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { get } from "svelte/store";

describe("network-economics-derived", () => {
  it("should return start reducing voting power", () => {
    expect(get(startReducingVotingPowerAfterSecondsStore)).toEqual(undefined);

    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    expect(get(startReducingVotingPowerAfterSecondsStore)).toEqual(
      BigInt(SECONDS_IN_HALF_YEAR)
    );
  });

  it("should return start reducing voting power", () => {
    expect(get(clearFollowingAfterSecondsStore)).toEqual(undefined);

    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    expect(get(clearFollowingAfterSecondsStore)).toEqual(
      BigInt(SECONDS_IN_MONTH)
    );
  });
});
