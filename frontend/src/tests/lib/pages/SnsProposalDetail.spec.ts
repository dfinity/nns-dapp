import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { authStore } from "$lib/stores/auth.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  buildMockSnsProposalsStoreSubscribe,
  createSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { SnsProposalDetailPo } from "$tests/page-objects/SnsProposalDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  SnsVote,
} from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-governance.api");

describe("SnsProposalDetail", () => {
  fakeSnsGovernanceApi.install();
  const proposalId = { id: 3n };
  const rootCanisterId = mockCanisterId;

  const renderComponent = async () => {
    const { container } = render(SnsProposalDetail, {
      props: {
        proposalIdText: proposalId.id.toString(),
      },
    });

    await runResolvedPromises();

    return SnsProposalDetailPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    page.reset();
  });

  describe("not logged in", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      actionableProposalsSegmentStore.resetForTesting();
      actionableSnsProposalsStore.resetForTesting();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      authStore.setForTesting(undefined);
      snsFunctionsStore.reset();
      page.mock({ data: { universe: rootCanisterId.toText() } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
    });

    it("should show skeleton while loading proposal", async () => {
      const proposalId = { id: 3n };
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });

      fakeSnsGovernanceApi.pause();
      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
    });

    it("should render content once proposal is loaded", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
      expect(await po.isContentLoaded()).toBe(false);

      fakeSnsGovernanceApi.resume();
      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));
      expect(await po.hasSummarySection()).toBe(true);
      expect(await po.hasSystemInfoSection()).toBe(true);
      expect(await po.getSkeletonDetails().isPresent()).toBe(false);
    });

    it("should update layout title text", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const spyOnSetTitle = vi.spyOn(layoutTitleStore, "set");
      const proposalIdText = proposalId.id.toString();
      render(SnsProposalDetail, {
        props: {
          proposalIdText,
        },
      });

      expect(spyOnSetTitle).toHaveBeenCalledTimes(1);
      expect(spyOnSetTitle).toHaveBeenCalledWith({
        title: `Proposal ${proposalIdText}`,
        header: `Proposal ${proposalIdText}`,
      });
    });

    it("should render the name of the nervous function as title", async () => {
      const functionId = 12n;
      const functionName = "test function";
      fakeSnsGovernanceApi.addNervousSystemFunctionWith({
        rootCanisterId,
        id: functionId,
        name: functionName,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
        action: functionId,
      });

      const po = await renderComponent();

      await waitFor(async () =>
        expect(await po.getSystemInfoSectionTitle()).toBe("Proposal Details")
      );
    });

    it("should render the payload", async () => {
      const payload = "Test payload";
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
        payload_text_rendering: [payload],
      });

      const po = await renderComponent();

      await waitFor(async () =>
        expect(await (await po.getPayloadText()).trim()).toBe(payload)
      );
    });

    it("should redirect to the list of sns proposals if proposal id is not a valid id", async () => {
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "invalid",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });

    it("should redirect to the list of sns proposals if proposal is not found", async () => {
      // There is no proposal with id 2 in the fake implementation.
      // Therefore, the page should redirect to the list of proposals.
      render(SnsProposalDetail, {
        props: {
          proposalIdText: "2",
        },
      });
      await waitFor(() => {
        const { path } = get(pageStore);
        return expect(path).toEqual(AppPath.Proposals);
      });
    });

    it("should not render content if universe changes to Nns", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const { container, rerender } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      expect(await po.getSkeletonDetails().isPresent()).toBe(true);
      expect(await po.isContentLoaded()).toBe(false);

      fakeSnsGovernanceApi.resume();
      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));

      page.mock({ data: { universe: OWN_CANISTER_ID.toText() } });

      rerender({
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      await waitFor(async () => expect(await po.isContentLoaded()).toBe(false));
    });

    it("should display proposal navigation", async () => {
      actionableProposalsSegmentStore.set("all");
      // mock the store to have 3 proposals for navigation
      vi.spyOn(snsFilteredProposalsStore, "subscribe").mockImplementation(
        buildMockSnsProposalsStoreSubscribe({
          universeIdText: rootCanisterId.toText(),
          proposals: [
            createSnsProposal({
              proposalId: 1n,
              status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
            }),
            createSnsProposal({
              proposalId: 2n,
              status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
            }),
            createSnsProposal({
              proposalId: 3n,
              status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
            }),
          ],
        })
      );

      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [{ id: 2n }],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          // set the proposal with id=2 to be in the middle of the list
          proposalIdText: "2",
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );

      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));

      const navigationPo = po.getProposalNavigationPo();
      expect(await navigationPo.isPresent()).toBe(true);
      expect(await navigationPo.getNextButtonPo().isPresent()).toBe(true);
      expect(await navigationPo.getPreviousButtonPo().isPresent()).toBe(true);
      expect(await navigationPo.getPreviousButtonProposalId()).toBe("3");
      expect(await navigationPo.getNextButtonProposalId()).toBe("1");
      // all buttons should be enabled
      expect(await navigationPo.getNextButtonPo().isDisabled()).toBe(false);
      expect(await navigationPo.getPreviousButtonPo().isDisabled()).toBe(false);
    });

    it("should display proposal navigation for actionable proposal", async () => {
      resetIdentity();
      actionableProposalsSegmentStore.set("actionable");
      const actionableProposals = [
        createSnsProposal({
          proposalId: 1n,
          status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        }),
        createSnsProposal({
          proposalId: 2n,
          status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        }),
        createSnsProposal({
          proposalId: 3n,
          status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        }),
      ];
      // Keep "all" proposals empty to make the test fail if not using the actionable proposals
      vi.spyOn(snsFilteredProposalsStore, "subscribe").mockImplementation(
        buildMockSnsProposalsStoreSubscribe({
          universeIdText: rootCanisterId.toText(),
          proposals: [],
        })
      );
      actionableSnsProposalsStore.set({
        rootCanisterId,
        includeBallotsByCaller: true,
        proposals: actionableProposals,
      });

      fakeSnsGovernanceApi.addProposalWith({
        identity: mockIdentity,
        rootCanisterId,
        id: [{ id: 2n }],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: "2",
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      await waitFor(async () => expect(await po.isContentLoaded()).toBe(true));

      const navigationPo = po.getProposalNavigationPo();
      expect(await navigationPo.isPresent()).toBe(true);
      expect(await navigationPo.getNextButtonPo().isPresent()).toBe(true);
      expect(await navigationPo.getPreviousButtonPo().isPresent()).toBe(true);
      // 4 <prev 3 next> 1
      expect(await navigationPo.getPreviousButtonProposalId()).toBe("3");
      expect(await navigationPo.getNextButtonProposalId()).toBe("1");
      // all buttons should be enabled
      expect(await navigationPo.getNextButtonPo().isDisabled()).toBe(false);
      expect(await navigationPo.getPreviousButtonPo().isDisabled()).toBe(false);
    });
  });

  it("should display proposal navigation buttons when user comes from actionable page", async () => {
    resetIdentity();
    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
    page.mock({
      data: { universe: rootCanisterId.toText(), actionable: true },
    });

    // mock the store to have 3 proposals for navigation
    vi.spyOn(snsFilteredProposalsStore, "subscribe").mockImplementation(
      buildMockSnsProposalsStoreSubscribe({
        universeIdText: rootCanisterId.toText(),
        proposals: [
          createSnsProposal({
            proposalId: 1n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          }),
          createSnsProposal({
            proposalId: 2n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          }),
          createSnsProposal({
            proposalId: 3n,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          }),
        ],
      })
    );

    fakeSnsGovernanceApi.addProposalWith({
      identity: mockIdentity,
      rootCanisterId,
      id: [{ id: 2n }],
    });

    const { container } = render(SnsProposalDetail, {
      props: {
        // set the proposal with id=2 to be in the middle of the list
        proposalIdText: "2",
      },
    });
    const po = SnsProposalDetailPo.under(new JestPageObjectElement(container));
    await runResolvedPromises();
    expect(await po.isContentLoaded()).toBe(true);

    const navigationPo = po.getProposalNavigationPo();
    expect(await navigationPo.isPresent()).toBe(true);
    expect(await navigationPo.isPreviousButtonHidden()).toBe(false);
    expect(await navigationPo.isNextButtonHidden()).toBe(false);
  });

  describe("not logged in that logs in afterwards", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      page.mock({ data: { universe: rootCanisterId.toText() } });
    });

    it("show neurons that can vote", async () => {
      authStore.setForTesting(undefined);
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);

      const proposalCreatedTimestamp = 33333n;
      const proposal = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId: proposalId.id,
      });

      fakeSnsGovernanceApi.addNeuronWith({
        identity: mockIdentity,
        rootCanisterId,
        id: mockSnsNeuron.id,
        // The neuron must have creation timestamp before the proposal
        created_timestamp_seconds: proposalCreatedTimestamp - 100n,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          },
        ],
      });

      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposal,
        proposal_creation_timestamp_seconds: proposalCreatedTimestamp,
        ballots: [
          [
            getSnsNeuronIdAsHexString(mockSnsNeuron),
            {
              vote: SnsVote.Unspecified,
              voting_power: 100_000_000n,
              cast_timestamp_seconds: 0n,
            },
          ],
        ],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );

      await runResolvedPromises();

      expect(await po.hasVotingToolbar()).toBe(false);

      authStore.setForTesting(mockIdentity);
      await runResolvedPromises();

      // await waitFor(async () => expect(await po.hasVotingToolbar()).toBe(true));
      expect(await po.hasVotingToolbar()).toBe(true);
    });
  });

  describe("An issue when the proposal w/o ballots from the store (from `proposalList` response) is used on proposal detail page", () => {
    beforeEach(() => {
      vi.clearAllMocks();

      resetIdentity();
      page.mock({ data: { universe: rootCanisterId.toText() } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
      snsProposalsStore.reset();
      snsNeuronsStore.reset();
    });

    // This test is related to the fix: https://github.com/dfinity/nns-dapp/pull/4420
    it("should reload sns proposal despite it's presence in the store to have user ballots", async () => {
      const proposal = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId: proposalId.id,
        ballots: [
          // this is a proposal from `proposalList` response, that contains no user ballots
        ],
      });

      snsProposalsStore.setProposals({
        rootCanisterId,
        proposals: [proposal],
        certified: true,
        completed: true,
      });

      fakeSnsGovernanceApi.addNeuronWith({
        identity: mockIdentity,
        rootCanisterId,
        id: mockSnsNeuron.id,
        // The neuron must have creation timestamp before the proposal
        created_timestamp_seconds:
          proposal.proposal_creation_timestamp_seconds - 100n,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          },
        ],
      });

      fakeSnsGovernanceApi.addProposalWith({
        identity: mockIdentity,
        rootCanisterId,
        ...proposal,
        ballots: [
          [
            getSnsNeuronIdAsHexString(mockSnsNeuron),
            {
              vote: SnsVote.Unspecified,
              voting_power: 100_000_000n,
              cast_timestamp_seconds: 0n,
            },
          ],
        ],
      });

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );

      await runResolvedPromises();

      const votingCardPo = await po
        .getSnsProposalVotingSectionPo()
        .getVotingCardPo();
      expect(await votingCardPo.isPresent()).toBe(true);
      expect(await votingCardPo.getVotableNeurons().isPresent()).toBe(true);
      expect(await votingCardPo.getIneligibleNeurons().isPresent()).toBe(false);
    });
  });
});
