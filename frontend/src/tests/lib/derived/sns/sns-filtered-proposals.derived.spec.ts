import { MIN_VALID_SNS_GENERIC_NERVOUS_SYSTEM_FUNCTION_ID } from "$lib/constants/sns-proposals.constants";
import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { unsupportedFilterByTopicSnsesStore } from "$lib/stores/sns-unsupported-filter-by-topic.store";
import {
  ALL_SNS_GENERIC_PROPOSAL_TYPES_ID,
  ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
} from "$lib/types/filters";
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
    // TODO: Type filtering will be removed at some point in favor of topic filtering
    unsupportedFilterByTopicSnsesStore.add(rootCanisterId.toText());

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
    // TODO: Type filtering will be removed at some point in favor of topic filtering
    unsupportedFilterByTopicSnsesStore.add(rootCanisterId.toText());

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

  it("should return all proposals if no topics are selected", () => {
    const governanceTopic = { Governance: null };
    const dappManagementTopic = { DappCanisterManagement: null };

    const proposalWithGovernanceTopic = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithGovernanceTopic.topic = [governanceTopic];

    const proposalWithDappTopic = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithDappTopic.topic = [dappManagementTopic];

    const proposalWithoutTopic = createSnsProposal({
      proposalId: 103n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithoutTopic.topic = [];

    const proposals = [
      proposalWithGovernanceTopic,
      proposalWithDappTopic,
      proposalWithoutTopic,
    ];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    snsFiltersStore.setTopics({
      rootCanisterId,
      topics: [
        {
          id: "Governance",
          value: "Governance",
          name: "Governance",
          checked: false,
        },
        {
          id: "DappCanisterManagement",
          value: "DappCanisterManagement",
          name: "Dapp Canister Management",
          checked: false,
        },
        {
          id: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          name: "Without Topic",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toHaveLength(proposals.length);
    expect(getProposals()).toEqual(proposals);
  });

  it("should filter proposals by topic when topic filter is selected", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);

    const governanceTopic = { Governance: null };
    const dappManagementTopic = { DappCanisterManagement: null };

    const proposalWithGovernanceTopic = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithGovernanceTopic.topic = [governanceTopic];

    const proposalWithDappTopic = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithDappTopic.topic = [dappManagementTopic];

    const proposalWithoutTopic = createSnsProposal({
      proposalId: 103n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithoutTopic.topic = [];

    const proposals = [
      proposalWithGovernanceTopic,
      proposalWithDappTopic,
      proposalWithoutTopic,
    ];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    snsFiltersStore.setTopics({
      rootCanisterId,
      topics: [
        {
          id: "Governance",
          value: "Governance",
          name: "Governance",
          checked: true,
        },
        {
          id: "DappCanisterManagement",
          value: "DappCanisterManagement",
          name: "Dapp Canister Management",
          checked: false,
        },
        {
          id: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          name: "Without Topic",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toHaveLength(1);
    expect(getProposals()).toEqual([proposalWithGovernanceTopic]);
  });

  it("should filter proposals without topics when 'Without Topic' filter is selected", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);

    const governanceTopic = { Governance: null };
    const dappManagementTopic = { DappCanisterManagement: null };

    const proposalWithGovernanceTopic = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithGovernanceTopic.topic = [governanceTopic];

    const proposalWithDappTopic = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithDappTopic.topic = [dappManagementTopic];

    const proposalWithoutTopic = createSnsProposal({
      proposalId: 103n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithoutTopic.topic = [];

    const proposals = [
      proposalWithGovernanceTopic,
      proposalWithDappTopic,
      proposalWithoutTopic,
    ];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    snsFiltersStore.setTopics({
      rootCanisterId,
      topics: [
        {
          id: "Governance",
          value: "Governance",
          name: "Governance",
          checked: false,
        },
        {
          id: "DappCanisterManagement",
          value: "DappCanisterManagement",
          name: "Dapp Canister Management",
          checked: false,
        },
        {
          id: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          name: "Without Topic",
          checked: true,
        },
      ],
    });

    expect(getProposals()).toHaveLength(1);
    expect(getProposals()).toEqual([proposalWithoutTopic]);
  });

  it("should filter proposals by multiple topics", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);

    const governanceTopic = { Governance: null };
    const dappManagementTopic = { DappCanisterManagement: null };
    const treasuryTopic = { TreasuryAssetManagement: null };

    const proposalWithGovernanceTopic = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithGovernanceTopic.topic = [governanceTopic];

    const proposalWithDappTopic = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithDappTopic.topic = [dappManagementTopic];

    const proposalWithTreasuryTopic = createSnsProposal({
      proposalId: 103n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithTreasuryTopic.topic = [treasuryTopic];

    const proposalWithoutTopic = createSnsProposal({
      proposalId: 104n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    proposalWithoutTopic.topic = [];

    const proposals = [
      proposalWithGovernanceTopic,
      proposalWithDappTopic,
      proposalWithTreasuryTopic,
      proposalWithoutTopic,
    ];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    snsFiltersStore.setTopics({
      rootCanisterId,
      topics: [
        {
          id: "Governance",
          value: "Governance",
          name: "Governance",
          checked: true,
        },
        {
          id: "DappCanisterManagement",
          value: "DappCanisterManagement",
          name: "Dapp Canister Management",
          checked: true,
        },
        {
          id: "TreasuryAssetManagement",
          value: "TreasuryAssetManagement",
          name: "Treasury Asset Management",
          checked: false,
        },
        {
          id: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          value: ALL_SNS_PROPOSALS_WITHOUT_TOPIC,
          name: "Without Topic",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toHaveLength(2);
    expect(getProposals()).toEqual([
      proposalWithGovernanceTopic,
      proposalWithDappTopic,
    ]);
  });

  it("should combine filters for status and type", () => {
    // TODO: Type filtering will be removed at some point in favor of topic filtering
    unsupportedFilterByTopicSnsesStore.add(rootCanisterId.toText());

    const nsFunctionId1 = 1n;
    const nsFunctionId2 = 2n;

    const openProposal = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      action: nsFunctionId1,
    });

    const rejectedProposal = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED,
      action: nsFunctionId2,
    });

    const proposals = [openProposal, rejectedProposal];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    // Set status filter to show only OPEN proposals
    snsFiltersStore.setDecisionStatus({
      rootCanisterId,
      decisionStatus: [
        {
          id: "1",
          name: "Open",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          checked: true,
        },
        {
          id: "2",
          name: "Rejected",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED,
          checked: false,
        },
      ],
    });

    // Set type filter to show all proposals
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
          checked: true,
        },
      ],
    });
    expect(getProposals()).toHaveLength(1);
    expect(getProposals()).toEqual([openProposal]);
  });

  it("should combine filters for status and topic", () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_SNS_TOPICS", true);

    const governanceTopic = { Governance: null };
    const dappManagementTopic = { DappCanisterManagement: null };

    // TODO(yhabib): Move topic logic inside mock function
    const openProposalWithGovernanceTopic = createSnsProposal({
      proposalId: 101n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    openProposalWithGovernanceTopic.topic = [governanceTopic];

    const rejectedProposalWithGovernanceTopic = createSnsProposal({
      proposalId: 102n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED,
    });
    rejectedProposalWithGovernanceTopic.topic = [governanceTopic];

    const openProposalWithDappTopic = createSnsProposal({
      proposalId: 103n,
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
    });
    openProposalWithDappTopic.topic = [dappManagementTopic];

    const proposals = [
      openProposalWithGovernanceTopic,
      rejectedProposalWithGovernanceTopic,
      openProposalWithDappTopic,
    ];

    snsProposalsStore.setProposals({
      rootCanisterId,
      proposals,
      certified: true,
      completed: true,
    });

    // Set status filter to show only OPEN proposals
    snsFiltersStore.setDecisionStatus({
      rootCanisterId,
      decisionStatus: [
        {
          id: "1",
          name: "Open",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          checked: true,
        },
        {
          id: "2",
          name: "Rejected",
          value: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_REJECTED,
          checked: false,
        },
      ],
    });

    // Set topic filter to show only Governance topics
    snsFiltersStore.setTopics({
      rootCanisterId,
      topics: [
        {
          id: "Governance",
          value: "Governance",
          name: "Governance",
          checked: true,
        },
        {
          id: "DappCanisterManagement",
          value: "DappCanisterManagement",
          name: "Dapp Canister Management",
          checked: false,
        },
      ],
    });

    expect(getProposals()).toHaveLength(1);
    expect(getProposals()).toEqual([openProposalWithGovernanceTopic]);
  });
});
