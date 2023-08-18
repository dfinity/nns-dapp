import { snsLifecycleStore } from "$lib/stores/sns-lifecycle.store";
import {
  mockLifecycleResponse,
  principal,
} from "$tests/mocks/sns-projects.mock";
import { SnsSwapLifecycle, type SnsGetLifecycleResponse } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns lifecycle store", () => {
  const anotherLifecycleResponse: SnsGetLifecycleResponse = {
    ...mockLifecycleResponse,
    lifecycle: [SnsSwapLifecycle.Committed],
  };

  beforeEach(() => {
    snsLifecycleStore.reset();
  });

  it("should create a store for a given root canister id and store lifecycle", () => {
    const rootCanisterId = principal(0);

    snsLifecycleStore.setData({
      certified: true,
      rootCanisterId,
      data: mockLifecycleResponse,
    });

    expect(get(snsLifecycleStore)[rootCanisterId.toText()].data).toEqual(
      mockLifecycleResponse
    );
  });

  it("should store multiple derived states", () => {
    const rootCanisterId = principal(0);
    const rootCanisterId2 = principal(1);

    snsLifecycleStore.setData({
      certified: true,
      rootCanisterId,
      data: mockLifecycleResponse,
    });

    snsLifecycleStore.setData({
      certified: true,
      rootCanisterId: rootCanisterId2,
      data: anotherLifecycleResponse,
    });

    expect(get(snsLifecycleStore)[rootCanisterId.toText()].data).toEqual(
      mockLifecycleResponse
    );
    expect(get(snsLifecycleStore)[rootCanisterId2.toText()].data).toEqual(
      anotherLifecycleResponse
    );
  });

  it("should override derived states", () => {
    const rootCanisterId = principal(0);

    snsLifecycleStore.setData({
      certified: true,
      rootCanisterId,
      data: mockLifecycleResponse,
    });

    expect(get(snsLifecycleStore)[rootCanisterId.toText()].data).toEqual(
      mockLifecycleResponse
    );

    snsLifecycleStore.setData({
      certified: true,
      rootCanisterId,
      data: anotherLifecycleResponse,
    });

    expect(get(snsLifecycleStore)[rootCanisterId.toText()].data).toEqual(
      anotherLifecycleResponse
    );
  });
});
