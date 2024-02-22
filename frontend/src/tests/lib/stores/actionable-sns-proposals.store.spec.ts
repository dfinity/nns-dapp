import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { Principal } from "@dfinity/principal";
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
  const principal1 = Principal.fromText("bw4dl-smaaa-aaaaa-qaacq-cai");
  const principal2 = Principal.fromText("pin7y-wyaaa-aaaaa-aacpa-cai");
  beforeEach(() => {
    actionableSnsProposalsStore.resetForTesting();
  });

  it("should store sns proposals", () => {
    actionableSnsProposalsStore.setProposals({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
    });
    actionableSnsProposalsStore.setProposals({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
    });

    expect(get(actionableSnsProposalsStore)[principal1.toText()]).toEqual([
      snsProposal1,
    ]);
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual([
      snsProposal2,
    ]);
  });

  it("should reset data by sns", () => {
    actionableSnsProposalsStore.setProposals({
      rootCanisterId: principal1,
      proposals: [snsProposal1],
    });
    actionableSnsProposalsStore.setProposals({
      rootCanisterId: principal2,
      proposals: [snsProposal2],
    });
    actionableSnsProposalsStore.resetForSns(principal1);
    expect(
      get(actionableSnsProposalsStore)[principal1.toText()]
    ).toBeUndefined();
    expect(get(actionableSnsProposalsStore)[principal2.toText()]).toEqual([
      snsProposal2,
    ]);
  });
});
