import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { snsFilteredProposalsStore } from "$lib/derived/sns/sns-filtered-proposals.derived";
import SnsProposalDetail from "$lib/pages/SnsProposalDetail.svelte";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { layoutTitleStore } from "$lib/stores/layout.store";
import { snsAggregatorStore } from "$lib/stores/sns-aggregator.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import {
  buildMockSnsProposalsStoreSubscribe,
  createSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { SnsProposalDetailPo } from "$tests/page-objects/SnsProposalDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  setProdSnsProjects,
  setSnsProjects,
} from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { Vote } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  SnsVote,
  type SnsBallot,
  type SnsProposalData,
} from "@dfinity/sns";
import type { NeuronPermission } from "@dfinity/sns/dist/candid/sns_governance";
import { waitFor } from "@testing-library/svelte";
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
    resetIdentity();
    page.reset();
  });

  describe("not logged in", () => {
    beforeEach(() => {
      setNoIdentity();
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
      vi.spyOn(console, "error").mockReturnValue();
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
      expect(console.error).toBeCalledWith(
        expect.objectContaining({
          error: new Error("No proposal for given proposalId 2"),
        })
      );
      expect(console.error).toBeCalledTimes(1);
    });

    it("should not render content if universe changes to Nns", async () => {
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        id: [proposalId],
      });
      fakeSnsGovernanceApi.pause();

      const { container, component } = render(SnsProposalDetail, {
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
      component.$set({ proposalIdText: proposalId.id.toString() });
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

  describe("cross-project navigation", () => {
    const principal1 = principal(11);
    const principal2 = principal(22);

    const mockCommittedSnsProjectsWithVotableProposals = (
      projects: Array<{ rootCanisterId: Principal; proposalIds: bigint[] }>
    ) => {
      const snsProjects = projects.map(({ rootCanisterId }) => ({
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      }));
      setSnsProjects(snsProjects);
      projects.forEach(({ rootCanisterId, proposalIds }) => {
        const proposals = proposalIds.map((proposalId) =>
          createSnsProposal({
            proposalId,
            status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          })
        );
        // set votable proposals
        actionableSnsProposalsStore.set({
          rootCanisterId,
          proposals,
        });
        // Add proposals to the fake api to be able to navigate to it
        proposalIds.forEach((proposalId) =>
          fakeSnsGovernanceApi.addProposalWith({
            identity: mockIdentity,
            rootCanisterId,
            id: [{ id: proposalId }],
          })
        );
      });
    };

    beforeEach(() => {
      // Actionable proposals are available for signed in user only
      resetIdentity();
    });

    it("should navigate to the proposal from the next Sns", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      mockCommittedSnsProjectsWithVotableProposals([
        { rootCanisterId: principal1, proposalIds: [20n, 19n] },
        { rootCanisterId: principal2, proposalIds: [30n, 29n] },
      ]);
      page.mock({
        data: { universe: principal1.toText(), actionable: true },
      });

      const { container } = render(SnsProposalDetail, {
        props: { proposalIdText: "19" },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      await runResolvedPromises();
      expect(await po.isContentLoaded()).toBe(true);

      const navigationPo = po.getProposalNavigationPo();
      expect(await navigationPo.isPresent()).toBe(true);
      expect(await navigationPo.isNextButtonHidden()).toBe(false);

      await navigationPo.clickNext();
      expect(get(page)).toEqual({
        data: {
          actionable: "",
          proposal: "30",
          universe: principal2.toText(),
        },
        route: {
          id: "/(app)/proposal/",
        },
      });

      await runResolvedPromises();
      // The navigation changes both the proposal ID and the universe.
      // In reality this will cause a navigation and a new component will be
      // rendered with the new proposal ID and universe.
      // But in the test, the component notices the change in universe (because
      // it comes from the store) but not the change in proposal ID (because
      // it's passed in as a prop). So it tries to load proposal 19 from the
      // wrong universe, which causes these errors.
      expect(console.error).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          error: new Error("No proposal for given proposalId 19"),
        })
      );
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          error: new Error("No proposal for given proposalId 19"),
        })
      );
      expect(console.error).toBeCalledTimes(2);
    });

    it("should navigate to the proposal from the previous Sns", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      mockCommittedSnsProjectsWithVotableProposals([
        { rootCanisterId: principal1, proposalIds: [20n, 19n] },
        { rootCanisterId: principal2, proposalIds: [30n, 29n] },
      ]);
      page.mock({
        data: { universe: principal2.toText(), actionable: true },
      });

      const { container } = render(SnsProposalDetail, {
        props: { proposalIdText: "30" },
      });
      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      await runResolvedPromises();
      expect(await po.isContentLoaded()).toBe(true);

      const navigationPo = po.getProposalNavigationPo();
      expect(await navigationPo.isPresent()).toBe(true);
      expect(await navigationPo.isPreviousButtonHidden()).toBe(false);

      await navigationPo.clickPrevious();
      expect(get(page)).toEqual({
        data: {
          actionable: "",
          proposal: "19",
          universe: principal1.toText(),
        },
        route: {
          id: "/(app)/proposal/",
        },
      });

      await runResolvedPromises();
      // The navigation changes both the proposal ID and the universe.
      // In reality this will cause a navigation and a new component will be
      // rendered with the new proposal ID and universe.
      // But in the test, the component notices the change in universe (because
      // it comes from the store) but not the change in proposal ID (because
      // it's passed in as a prop). So it tries to load proposal 30 from the
      // wrong universe, which causes these errors.
      expect(console.error).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          error: new Error("No proposal for given proposalId 30"),
        })
      );
      expect(console.error).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          error: new Error("No proposal for given proposalId 30"),
        })
      );
      expect(console.error).toBeCalledTimes(2);
    });
  });

  describe("not logged in that logs in afterwards", () => {
    beforeEach(() => {
      page.mock({ data: { universe: rootCanisterId.toText() } });
    });

    it("show neurons that can vote", async () => {
      setNoIdentity();
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

      fakeSnsGovernanceApi.addProposalWith({
        identity: mockIdentity,
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

      resetIdentity();
      await runResolvedPromises();

      expect(await po.hasVotingToolbar()).toBe(true);
    });
  });

  describe("An issue when the proposal w/o ballots from the store (from `proposalList` response) is used on proposal detail page", () => {
    beforeEach(() => {
      page.mock({ data: { universe: rootCanisterId.toText() } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
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

  describe('When one voting neuron follows another voting neuron and the second vote returns "Neuron already voted" error', () => {
    beforeEach(() => {
      page.mock({ data: { universe: rootCanisterId.toText() } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
      ]);
    });

    it("should keep the voting buttons disabled throughout the entire voting process", async () => {
      const proposal = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId: proposalId.id,
      });
      const votingNeuronParams = {
        identity: mockIdentity,
        rootCanisterId,
        created_timestamp_seconds:
          proposal.proposal_creation_timestamp_seconds - 100n,
        permissions: [
          {
            principal: [mockIdentity.getPrincipal()],
            permission_type: Int32Array.from([
              SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE,
            ]),
          } as NeuronPermission,
        ],
      };
      const neuron1 = fakeSnsGovernanceApi.addNeuronWith({
        ...votingNeuronParams,
        id: [{ id: [1] }],
      });
      const neuron2 = fakeSnsGovernanceApi.addNeuronWith({
        ...votingNeuronParams,
        id: [{ id: [2] }],
      });
      const neuron1Id = getSnsNeuronIdAsHexString(neuron1);
      const neuron2Id = getSnsNeuronIdAsHexString(neuron2);
      const ballotsWithVote = (vote: Vote) =>
        [
          [
            neuron1Id,
            {
              vote,
              voting_power: 100_000_000n,
              cast_timestamp_seconds: 0n,
            },
          ],
          [
            neuron2Id,
            {
              vote,
              voting_power: 100_000_000n,
              cast_timestamp_seconds: 0n,
            },
          ],
        ] as [string, SnsBallot][];

      snsProposalsStore.setProposals({
        rootCanisterId,
        proposals: [proposal],
        certified: true,
        completed: true,
      });

      const proposalToVote = fakeSnsGovernanceApi.addProposalWith({
        rootCanisterId,
        ...proposal,
        ballots: ballotsWithVote(Vote.Unspecified),
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

      let resolveQueryProposalApi;
      const resolveQueryProposalApiPromise = new Promise(
        (resolve) =>
          (resolveQueryProposalApi = () =>
            resolve({
              ...proposalToVote,
              // voted state
              ballots: ballotsWithVote(Vote.Yes),
            }))
      );
      const spyQueryProposalApi = vi
        .spyOn(snsGovernanceApi, "queryProposal")
        .mockImplementation(
          () => resolveQueryProposalApiPromise as Promise<SnsProposalData>
        );

      expect(spyQueryProposalApi).toBeCalledTimes(0);

      let resolveNeuron1VoteRegistration;
      let rejectNeuron2VoteRegistration;
      const spyRegisterVoteApi = vi
        .spyOn(snsGovernanceApi, "registerVote")
        .mockImplementationOnce(
          () =>
            new Promise(
              (resolve) => (resolveNeuron1VoteRegistration = resolve)
            ) as Promise<void>
        )
        .mockImplementationOnce(
          () =>
            new Promise(
              (_, reject) => (rejectNeuron2VoteRegistration = reject)
            ) as Promise<void>
        );

      expect(spyRegisterVoteApi).toBeCalledTimes(0);
      expect(spyQueryProposalApi).toBeCalledTimes(0);

      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(false);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(false);

      await votingCardPo.voteYes();
      await runResolvedPromises();

      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(true);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(true);

      // Neuron 1 votes
      resolveNeuron1VoteRegistration();
      await runResolvedPromises();

      // Simulate the neuron 2 to follow the neuron 1
      rejectNeuron2VoteRegistration(
        new Error("Neuron already voted on proposal.")
      );
      await runResolvedPromises();

      // If the second neuron to vote follows the first neuron, voting with the first neuron results in the second
      // neuron already having voted. In that case voting with the second neuron results in an error. Normally when
      // voting results in an error, we assume that the neuron hasn't voted yet. This results in the voting button
      // becoming enabled again. So we need to make sure that if the error is because the neuron has already voted,
      // we don't treat the neuron as not having voted yet.
      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(true);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(true);

      // Now that we’ve tested that the buttons are disabled, we can proceed with resolving the proposal reload.
      resolveQueryProposalApi();
      await runResolvedPromises();

      expect(await votingCardPo.getVoteYesButtonPo().isDisabled()).toBe(true);
      expect(await votingCardPo.getVoteNoButtonPo().isDisabled()).toBe(true);

      // Two neurons should vote
      expect(spyRegisterVoteApi).toBeCalledTimes(2);
      // Proposals should be reloaded after voting
      expect(spyQueryProposalApi).toBeCalledTimes(2);
    });
  });

  describe("With aborted SNS without nervous system parameters", () => {
    beforeEach(() => {
      setNoIdentity();
      page.mock({ data: { universe: rootCanisterId.toText() } });
      setSnsProjects([
        {
          rootCanisterId,
          lifecycle: SnsSwapLifecycle.Committed,
        },
        // This project is not used, but its presence also shouldn't cause
        // errors.
        {
          nervousSystemParameters: null,
          lifecycle: SnsSwapLifecycle.Aborted,
        },
      ]);
    });

    it("should render content without errors", async () => {
      const proposal = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId: proposalId.id,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposal,
      });

      expect(get(toastsStore)).toEqual([]);

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      await runResolvedPromises();

      expect(get(toastsStore)).toEqual([]);
      expect(await po.isContentLoaded()).toBe(true);
      expect(await po.hasSummarySection()).toBe(true);
      expect(await po.hasSystemInfoSection()).toBe(true);
      expect(await po.getSnsProposalVotingSectionPo().isPresent()).toBe(true);
      expect(
        await po.getSnsProposalVotingSectionPo().getVotingCardPo().isPresent()
      ).toBe(true);
      expect(await po.getSkeletonDetails().isPresent()).toBe(false);
    });
  });

  describe("With prod SNSes", () => {
    let rootCanisterId;

    beforeEach(async () => {
      setNoIdentity();
      await setProdSnsProjects();

      expect(get(snsAggregatorStore).data.length).toBeGreaterThan(25);
      rootCanisterId = Principal.fromText(
        get(snsAggregatorStore).data[0].canister_ids.root_canister_id
      );

      page.mock({ data: { universe: rootCanisterId.toText() } });
    });

    it("should render content without errors", async () => {
      const proposal = createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId: proposalId.id,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposal,
      });

      expect(get(toastsStore)).toEqual([]);

      const { container } = render(SnsProposalDetail, {
        props: {
          proposalIdText: proposalId.id.toString(),
        },
      });

      const po = SnsProposalDetailPo.under(
        new JestPageObjectElement(container)
      );
      await runResolvedPromises();

      expect(get(toastsStore)).toEqual([]);
      expect(await po.isContentLoaded()).toBe(true);
      expect(await po.hasSummarySection()).toBe(true);
      expect(await po.hasSystemInfoSection()).toBe(true);
      expect(await po.getSnsProposalVotingSectionPo().isPresent()).toBe(true);
      expect(
        await po.getSnsProposalVotingSectionPo().getVotingCardPo().isPresent()
      ).toBe(true);
      expect(await po.getSkeletonDetails().isPresent()).toBe(false);
    });
  });
});
