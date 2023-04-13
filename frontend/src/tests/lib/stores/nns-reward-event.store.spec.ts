import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { get } from "svelte/store";

describe("nnsLatestRewardEventStore", () => {
  beforeEach(() => {
    nnsLatestRewardEventStore.reset();
  });

  it("should set reward event", () => {
    const initialReward = get(nnsLatestRewardEventStore);
    expect(initialReward).toBeUndefined();

    nnsLatestRewardEventStore.setLatestRewardEvent(mockRewardEvent);
    expect(get(nnsLatestRewardEventStore)).toEqual(mockRewardEvent);

    const anotherReward = {
      ...mockRewardEvent,
      day_after_genesis: BigInt(4),
    };
    nnsLatestRewardEventStore.setLatestRewardEvent(anotherReward);
    expect(get(nnsLatestRewardEventStore)).toEqual(anotherReward);
  });
});
