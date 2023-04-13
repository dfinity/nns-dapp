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

    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: mockRewardEvent,
      certified: true,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(mockRewardEvent);

    const anotherReward = {
      ...mockRewardEvent,
      actual_timestamp_seconds: mockRewardEvent.actual_timestamp_seconds + 1n,
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: anotherReward,
      certified: true,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(anotherReward);
  });

  it("should not set an older reward event if current is certified", () => {
    const newReward = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(4),
    };
    const oldReward = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(3),
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: newReward,
      certified: true,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(newReward);
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: oldReward,
      certified: true,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(newReward);
  });

  it("should set an older reward event if current is not certified", () => {
    const newReward = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(4),
    };
    const oldReward = {
      ...mockRewardEvent,
      actual_timestamp_seconds: BigInt(3),
    };
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: newReward,
      certified: false,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(newReward);
    nnsLatestRewardEventStore.setLatestRewardEvent({
      rewardEvent: oldReward,
      certified: true,
    });
    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(oldReward);
  });
});
