import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_MONTH,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import {
  clearFollowingAfterSecondsStore,
  neuronMinimumDissolveDelayToVoteSeconds,
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

  it("should return clear following", () => {
    expect(get(clearFollowingAfterSecondsStore)).toEqual(undefined);

    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });

    expect(get(clearFollowingAfterSecondsStore)).toEqual(
      BigInt(SECONDS_IN_MONTH)
    );
  });

  describe("neuronMinimumDissolveDelayToVoteSeconds", () => {
    it("should return default 6M if value is not provided by the API", () => {
      networkEconomicsStore.setParameters({
        parameters: {
          ...mockNetworkEconomics,

          votingPowerEconomics: {
            ...mockNetworkEconomics.votingPowerEconomics,
            neuronMinimumDissolveDelayToVoteSeconds: undefined,
          },
        },
        certified: true,
      });

      expect(get(neuronMinimumDissolveDelayToVoteSeconds)).toEqual(
        BigInt(SECONDS_IN_HALF_YEAR)
      );
    });
    it("should return neuron minimum dissolve delay to vote seconds", () => {
      networkEconomicsStore.setParameters({
        parameters: mockNetworkEconomics,
        certified: true,
      });

      expect(get(neuronMinimumDissolveDelayToVoteSeconds)).toEqual(
        BigInt(SECONDS_IN_YEAR)
      );
    });
  });
});
