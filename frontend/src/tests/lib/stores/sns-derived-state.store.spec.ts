import { snsDerivedStateStore } from "$lib/stores/sns-derived-state.store";
import { mockDerivedResponse, principal } from "$tests/mocks/sns-projects.mock";
import type { SnsSwapDid } from "@icp-sdk/canisters/sns";
import { get } from "svelte/store";

describe("sns derived state store", () => {
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

    const anotherDerivedResponse: SnsSwapDid.GetDerivedStateResponse = {
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

    const anotherDerivedResponse: SnsSwapDid.GetDerivedStateResponse = {
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

  it("should keep the certified participant count when an uncertified response follows", () => {
    const rootCanisterId = principal(0);
    const forgedResponse: SnsSwapDid.GetDerivedStateResponse = {
      ...mockDerivedResponse,
      direct_participant_count: [999_999n],
    };

    snsDerivedStateStore.setDerivedState({
      certified: true,
      rootCanisterId,
      data: mockDerivedResponse,
    });
    snsDerivedStateStore.setDerivedState({
      certified: false,
      rootCanisterId,
      data: forgedResponse,
    });
    snsDerivedStateStore.setDerivedState({
      certified: false,
      rootCanisterId,
      data: forgedResponse,
    });

    const projectData = get(snsDerivedStateStore)[rootCanisterId.toText()];
    expect(projectData.derivedState).toEqual(forgedResponse);
    expect(projectData.certified).toBe(false);
    expect(projectData.certifiedDirectParticipantCount).toEqual(
      mockDerivedResponse.direct_participant_count
    );
  });

  it("should not set a certified participant count from an uncertified response", () => {
    const rootCanisterId = principal(0);

    snsDerivedStateStore.setDerivedState({
      certified: false,
      rootCanisterId,
      data: mockDerivedResponse,
    });

    expect(
      get(snsDerivedStateStore)[rootCanisterId.toText()]
        .certifiedDirectParticipantCount
    ).toBeUndefined();
  });
});
