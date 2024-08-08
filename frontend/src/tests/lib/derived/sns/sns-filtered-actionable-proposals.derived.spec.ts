import { snsFilteredActionableProposalsStore } from "$lib/derived/sns/sns-filtered-actionable-proposals.derived";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsProposalData } from "@dfinity/sns";
import { SnsProposalDecisionStatus } from "@dfinity/sns";
import { get } from "svelte/store";

describe("snsFilteredActionableProposalsStore", () => {
  const rootCanisterId = mockPrincipal;
  const snsProposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 1n }],
  };
  const snsProposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const snsProposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 3n }],
  };

  beforeEach(() => {
    snsProposalsStore.reset();
    actionableSnsProposalsStore.resetForTesting();

    const decisionStatus = [
      {
        id: "1",
        name: "status-1",
        value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        checked: false,
      },
      {
        id: "2",
        name: "status-2",
        value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
        checked: false,
      },
    ];
    // Set decisions filter to false to ignore proposal filtering and return all proposals
    snsFiltersStore.setDecisionStatus({
      rootCanisterId,
      decisionStatus,
    });
  });

  it("should return proposals with isActionable state", async () => {
    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals: [snsProposal1, snsProposal2, snsProposal3],
      certified: true,
      completed: true,
    });
    actionableSnsProposalsStore.set({
      rootCanisterId,
      proposals: [snsProposal1, snsProposal3],
    });

    await runResolvedPromises();

    expect(get(snsFilteredActionableProposalsStore)).toEqual({
      [rootCanisterId.toText()]: [
        {
          ...snsProposal1,
          isActionable: true,
        },
        {
          ...snsProposal2,
          isActionable: false,
        },
        {
          ...snsProposal3,
          isActionable: true,
        },
      ],
    });
  });

  it("should return undefined when no actionable information available", () => {
    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals: [snsProposal1, snsProposal2, snsProposal3],
      certified: true,
      completed: true,
    });

    expect(get(snsFilteredActionableProposalsStore)).toEqual({
      [rootCanisterId.toText()]: [
        {
          ...snsProposal1,
          isActionable: undefined,
        },
        {
          ...snsProposal2,
          isActionable: undefined,
        },
        {
          ...snsProposal3,
          isActionable: undefined,
        },
      ],
    });
  });
});
