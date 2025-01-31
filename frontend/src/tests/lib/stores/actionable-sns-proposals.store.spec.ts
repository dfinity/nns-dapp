import {
  actionableSnsProposalsStore,
  failedActionableSnsesStore,
} from "$lib/stores/actionable-sns-proposals.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import type { SnsProposalData } from "@dfinity/sns";
import { get } from "svelte/store";

describe("actionableSnsProposalsStore", () => {
  const snsProposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 1n }],
  };
  const snsProposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const principal1 = principal(0);
  const principal2 = principal(1);
  const principal3 = principal(2);

  it("should store sns proposals", () => {
    actionableSnsProposalsStore.set({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal3,
      proposals: [],
    });

    expect(get(actionableSnsProposalsStore)[principal1.toText()]).toEqual({
      proposals: [snsProposal1],
    });
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual({
      proposals: [snsProposal2],
    });
    expect(get(actionableSnsProposalsStore)[principal3.toText()]).toEqual({
      proposals: [],
    });
  });

  it("should reset data by sns", () => {
    actionableSnsProposalsStore.set({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
    });
    actionableSnsProposalsStore.resetForSns(principal1);
    expect(
      get(actionableSnsProposalsStore)[principal1.toText()]
    ).toBeUndefined();
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual({
      proposals: [snsProposal2],
    });
  });
});

describe("failedActionableSnsesStore", () => {
  it("should store root canister ids", () => {
    expect(get(failedActionableSnsesStore)).toEqual([]);
    failedActionableSnsesStore.add("1");
    failedActionableSnsesStore.add("2");
    expect(get(failedActionableSnsesStore)).toEqual(["1", "2"]);
  });

  it("should store only unique ids", () => {
    expect(get(failedActionableSnsesStore)).toEqual([]);
    failedActionableSnsesStore.add("1");
    failedActionableSnsesStore.add("2");
    failedActionableSnsesStore.add("1");
    expect(get(failedActionableSnsesStore)).toEqual(["1", "2"]);
  });

  it("should remove ids", () => {
    expect(get(failedActionableSnsesStore)).toEqual([]);
    failedActionableSnsesStore.add("1");
    failedActionableSnsesStore.add("2");
    failedActionableSnsesStore.add("3");
    expect(get(failedActionableSnsesStore)).toEqual(["1", "2", "3"]);
    failedActionableSnsesStore.remove("5");
    failedActionableSnsesStore.remove("2");
    failedActionableSnsesStore.remove("2");
    expect(get(failedActionableSnsesStore)).toEqual(["1", "3"]);
  });
});
