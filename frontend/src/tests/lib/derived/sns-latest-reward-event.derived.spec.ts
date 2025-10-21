import { snsLatestRewardEventStore } from "$lib/derived/sns-latest-reward-event.derived";
import type { RewardEventDto } from "$lib/types/sns-aggregator";
import { principal } from "$tests/mocks/sns-projects.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { SnsRewardEvent } from "@icp-sdk/canisters/sns";
import { get } from "svelte/store";

describe("snsLatestRewardEventStore", () => {
  const rootCanisterId = principal(0);

  it("should handle missing data", () => {
    setSnsProjects([
      {
        rootCanisterId,
      },
    ]);

    expect(get(snsLatestRewardEventStore)[rootCanisterId.toText()]).toEqual(
      undefined
    );
  });

  it("should convert data", () => {
    const expectedRewardEvent: SnsRewardEvent = {
      rounds_since_last_distribution: [1n],
      actual_timestamp_seconds: 1752160922n,
      end_timestamp_seconds: [1752160920n],
      total_available_e8s_equivalent: [0n],
      distributed_e8s_equivalent: 0n,
      round: 1n,
      settled_proposals: [{ id: 123n }],
    };
    const mockRewardEvent = {
      rounds_since_last_distribution: 1,
      actual_timestamp_seconds: 1752160922,
      end_timestamp_seconds: 1752160920,
      total_available_e8s_equivalent: 0,
      distributed_e8s_equivalent: 0,
      round: 1,
      settled_proposals: [{ id: 123 }],
    } as RewardEventDto;

    setSnsProjects([
      {
        rootCanisterId,
        latestRewardEvent: mockRewardEvent,
      },
    ]);

    expect(get(snsLatestRewardEventStore)[rootCanisterId.toText()]).toEqual(
      expectedRewardEvent
    );
  });
});
