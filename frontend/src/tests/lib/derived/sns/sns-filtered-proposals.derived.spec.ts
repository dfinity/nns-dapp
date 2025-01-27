import { MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { ALL_SNS_GENERIC_PROPOSAL_TYPES_ID } from "$lib/types/filters";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { SnsProposalDecisionStatus, type SnsProposalData } from "@dfinity/sns";
import { get } from "svelte/store";

describe("snsFilteredProposalsStore", () => {
  const rootCanisterId = mockPrincipal;
  const getProposals = (): SnsProposalData[] =>
    get(snsFilteredProposalsStore)[rootCanisterId.toText()]?.proposals;
  const snsProposal1: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const snsProposal2: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 2n }],
  };
  const snsProposal3: SnsProposalData = {
    ...mockSnsProposal,
    id: [{ id: 3n }],
  };

  it("should return undefined if filter store is not loaded", () => {
    const proposals: SnsProposalData[] = [
      snsProposal1,
      snsProposal2,
      snsProposal3,
    ];
    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    expect(
      get(snsFilteredProposalsStore)[rootCanisterId.toText()]
    ).toBeUndefined();
  });

  it("should return all proposals if no decisions filter is checked", () => {
    const proposals: SnsProposalData[] = [
      snsProposal1,
      snsProposal2,
      snsProposal3,
    ];
    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });
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
    snsFiltersStore.setDecisionStatus({
      rootCanisterId,
      decisionStatus,
    });

    expect(getProposals()).toHaveLength(proposals.length);
  });

  it("should return open proposals if Open status is checked", () => {
    const openProposal = createSnsProposal({
      proposalId: 2n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const failedProposal1 = createSnsProposal({
      proposalId: 3n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED,
    });
    const failedProposal2 = createSnsProposal({
      proposalId: 4n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_FAILED,
    });
    const proposals: SnsProposalData[] = [
      failedProposal1,
      openProposal,
      failedProposal2,
    ];
    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });
    const decisionStatus = [
      {
        id: "1",
        name: "status-1",
        value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        checked: true,
      },
      {
        id: "2",
        name: "status-2",
        value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_ADOPTED,
        checked: false,
      },
    ];
    snsFiltersStore.setDecisionStatus({
      rootCanisterId,
      decisionStatus,
    });

    expect(getProposals()).toHaveLength(1);
  });

  it("should return proposals which type is checked", () => {
    const nsFunctionId1 = 1n;
    const nsFunctionId2 = 2n;
    const proposal1 = createSnsProposal({
      proposalId: 1000n,
      action: nsFunctionId1,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const proposal2 = createSnsProposal({
      proposalId: 2000n,
      action: nsFunctionId2,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals: [proposal1, proposal2],
      certified: true,
      completed: true,
    });

    // Check only one type
    snsFiltersStore.setTypes({
      rootCanisterId,
      types: [
        {
          id: `${nsFunctionId1}`,
          value: `${nsFunctionId1}`,
          name: "Motion",
          checked: true,
        },
        {
          id: `${nsFunctionId2}`,
          value: `${nsFunctionId2}`,
          name: "Add a Node",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toEqual([proposal1]);

    // Check the second type
    snsFiltersStore.setTypes({
      rootCanisterId,
      types: [
        {
          id: `${nsFunctionId1}`,
          value: `${nsFunctionId1}`,
          name: "_",
          checked: true,
        },
        {
          id: `${nsFunctionId2}`,
          value: `${nsFunctionId2}`,
          name: "_",
          checked: true,
        },
      ],
    });

    expect(getProposals()).toEqual([proposal1, proposal2]);
  });

  it('should return all generic proposals when "All generic" is checked', () => {
    const nativeNsFunctionId = 1n;
    const nativeTypeProposal = createSnsProposal({
      proposalId: 9001n,
      action: nativeNsFunctionId,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const genericTypeProposal1 = createSnsProposal({
      proposalId: 9002n,
      action: MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    const genericTypeProposal2 = createSnsProposal({
      proposalId: 9003n,
      action: MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID + 1n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals: [
        nativeTypeProposal,
        genericTypeProposal1,
        genericTypeProposal2,
      ],
      certified: true,
      completed: true,
    });
    snsFiltersStore.setTypes({
      rootCanisterId,
      types: [
        {
          id: `${nativeNsFunctionId}`,
          value: `${nativeNsFunctionId}`,
          name: "Motion",
          checked: true,
        },
        {
          id: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
          value: ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
          name: "All SNS Specific Functions",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toHaveLength(1);
    expect(getProposals()).toEqual([nativeTypeProposal]);

    snsFiltersStore.setCheckTypes({
      rootCanisterId,
      checkedTypes: [ALL_SNS_GENERIC_PROPOSAL_TYPES_ID],
    });

    expect(getProposals()).toHaveLength(2);
    expect(getProposals()).toEqual([
      genericTypeProposal1,
      genericTypeProposal2,
    ]);
  });
});
