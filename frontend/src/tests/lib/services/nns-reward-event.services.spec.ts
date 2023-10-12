import * as api from "$lib/api/governance.api";
import * as authServices from "$lib/services/auth.services";
import { loadLatestRewardEvent } from "$lib/services/nns-reward-event.services";
import { nnsLatestRewardEventStore } from "$lib/stores/nns-latest-reward-event.store";
import {
  mockGetIdentity,
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockRewardEvent } from "$tests/mocks/nns-reward-event.mock";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";

describe("nns-reward-event-services", () => {
  let spyQueryLatestRewardEvent: SpyInstance;

  beforeEach(() => {
    nnsLatestRewardEventStore.reset();
    vi.clearAllMocks();
    spyQueryLatestRewardEvent = vi
      .spyOn(api, "queryLastestRewardEvent")
      .mockResolvedValue(mockRewardEvent);
    resetIdentity();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockImplementation(
      mockGetIdentity
    );
  });

  it("should load nns reward event store", async () => {
    expect(get(nnsLatestRewardEventStore)).toBeUndefined();

    await loadLatestRewardEvent();

    expect(spyQueryLatestRewardEvent).toHaveBeenCalled();

    expect(get(nnsLatestRewardEventStore).rewardEvent).toEqual(mockRewardEvent);
  });

  it("should not load reward event if no identity", async () => {
    setNoIdentity();

    const call = async () => await loadLatestRewardEvent();

    expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));
    expect(get(nnsLatestRewardEventStore)).toBeUndefined();

    resetIdentity();
  });
});
