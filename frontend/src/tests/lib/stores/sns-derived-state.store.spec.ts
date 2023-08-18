import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { mockDerivedResponse, principal } from "$tests/mocks/sns-projects.mock";
import type { SnsGetDerivedStateResponse } from "@dfinity/sns";
import { get } from "svelte/store";

describe("sns derived state store", () => {
  beforeEach(() => {
    snsDerivedStateStore.reset();
  });

  it("should store derived state", () => {
    const rootCanisterId = principal(0);

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId,
      data: mockDerivedResponse,
    });

    expect(
      get(snsDerivedStateStore)[rootCanisterId.toText()].derivedState
    ).toEqual(mockDerivedResponse);
  });

  it("should store multiple derived states", () => {
    const rootCanisterId = principal(0);
    const rootCanisterId2 = principal(1);

    const anotherDerivedResponse: SnsGetDerivedStateResponse = {
      ...mockDerivedResponse,
      sns_tokens_per_icp: [4],
    };

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId,
      data: mockDerivedResponse,
    });

    expect(
      get(snsDerivedStateStore)[rootCanisterId.toText()].derivedState
    ).toEqual(mockDerivedResponse);

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId: rootCanisterId2,
      data: anotherDerivedResponse,
    });

    const storeData = get(snsDerivedStateStore);
    expect(storeData[rootCanisterId.toText()].derivedState).toEqual(
      mockDerivedResponse
    );
    expect(storeData[rootCanisterId2.toText()].derivedState).toEqual(
      anotherDerivedResponse
    );
  });

  it("should override derived states", () => {
    const rootCanisterId = principal(0);

    const anotherDerivedResponse: SnsGetDerivedStateResponse = {
      ...mockDerivedResponse,
      sns_tokens_per_icp: [4],
    };

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId,
      data: mockDerivedResponse,
    });

    expect(
      get(snsDerivedStateStore)[rootCanisterId.toText()].derivedState
    ).toEqual(mockDerivedResponse);

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId,
      data: anotherDerivedResponse,
    });

    expect(
      get(snsDerivedStateStore)[rootCanisterId.toText()].derivedState
    ).toEqual(anotherDerivedResponse);
  });
});
