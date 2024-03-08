import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
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
  beforeEach(() => {
    actionableSnsProposalsStore.resetForTesting();
  });

  it("should store sns proposals", () => {
    actionableSnsProposalsStore.set({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
      includeBallotsByCaller: true,
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
      includeBallotsByCaller: true,
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal3,
      proposals: [],
      includeBallotsByCaller: false,
    });

    expect(get(actionableSnsProposalsStore)[principal1.toText()]).toEqual({
      proposals: [snsProposal1],
      includeBallotsByCaller: true,
    });
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual({
      proposals: [snsProposal2],
      includeBallotsByCaller: true,
    });
    expect(get(actionableSnsProposalsStore)[principal3.toText()]).toEqual({
      proposals: [],
      includeBallotsByCaller: false,
    });
  });

  it("should reset data by sns", () => {
    actionableSnsProposalsStore.set({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
      includeBallotsByCaller: true,
    });
    actionableSnsProposalsStore.set({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
      includeBallotsByCaller: true,
    });
    actionableSnsProposalsStore.resetForSns(principal1);
    expect(
      get(actionableSnsProposalsStore)[principal1.toText()]
    ).toBeUndefined();
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual({
      proposals: [snsProposal2],
      includeBallotsByCaller: true,
    });
  });
});
