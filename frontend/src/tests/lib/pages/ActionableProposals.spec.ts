import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import ActionableProposals from "$lib/pages/ActionableProposals.svelte";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { ActionableProposalsPo } from "$tests/page-objects/ActionableProposals.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { ProposalInfo } from "@dfinity/nns";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";

describe("ActionableProposals", () => {
  const renderComponent = async () => {
    const { container } = render(ActionableProposals);
    await runResolvedPromises();
    return ActionableProposalsPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    resetIdentity();
    resetSnsProjects();
    actionableNnsProposalsStore.reset();
    actionableSnsProposalsStore.resetForTesting();

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
  });

  describe("Actionable Nns proposals", () => {
    const nnsProposal1: ProposalInfo = { ...mockProposalInfo, id: 11n };
    const nnsProposal2: ProposalInfo = { ...mockProposalInfo, id: 22n };

    it("should render actionable Nns proposals", async () => {
      const po = await renderComponent();

      expect(await po.hasActionableNnsProposals()).toEqual(false);

      actionableNnsProposalsStore.setProposals([nnsProposal1, nnsProposal2]);
      await runResolvedPromises();
      expect(await po.hasActionableNnsProposals()).toEqual(true);

      expect(
        await po
          .getActionableNnsProposalsPo()
          .getUniverseWithActionableProposalsPo()
          .getTitle()
      ).toEqual("Internet Computer");

      const proposalCardPos = await po
        .getActionableNnsProposalsPo()
        .getProposalCardPos();
      expect(proposalCardPos.length).toEqual(2);
      expect(await proposalCardPos[0].getProposalId()).toEqual("ID: 11");
      expect(await proposalCardPos[1].getProposalId()).toEqual("ID: 22");
    });
  });

  describe("Actionable Sns proposals", () => {
    const createProposal = (proposalId: bigint): SnsProposalData =>
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
        proposalId,
      });
    const proposal0 = createProposal(11n);
    const proposal1 = createProposal(22n);
    const proposal2 = createProposal(33n);
    const principal0 = principal(0);
    const principal1 = principal(1);
    const principal2 = principal(2);
    const principal3 = principal(3);

    beforeEach(() => {
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          projectName: "Sns Project 0",
          rootCanisterId: principal0,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          projectName: "Sns Project 1",
          rootCanisterId: principal1,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          projectName: "Sns Project 2",
          rootCanisterId: principal2,
        },
        {
          lifecycle: SnsSwapLifecycle.Committed,
          projectName: "Sns Project 3",
          rootCanisterId: principal3,
        },
      ]);
    });

    it("should render actionable Sns proposals", async () => {
      const po = await renderComponent();

      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [proposal0],
        includeBallotsByCaller: true,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [proposal1, proposal2],
        includeBallotsByCaller: true,
      });

      await runResolvedPromises();
      const snsProposalsPos = await po
        .getActionableSnses()
        .getActionableSnsProposalsPos();
      expect(snsProposalsPos).toHaveLength(2);
      expect(
        await snsProposalsPos[0]
          .getUniverseWithActionableProposalsPo()
          .getTitle()
      ).toEqual("Sns Project 0");
      const proposalCardPos0 = await snsProposalsPos[0].getProposalCardPos();
      expect(proposalCardPos0.length).toEqual(1);
      expect(await proposalCardPos0[0].getProposalId()).toEqual("ID: 11");

      expect(
        await snsProposalsPos[1]
          .getUniverseWithActionableProposalsPo()
          .getTitle()
      ).toEqual("Sns Project 1");
      const proposalCardPos1 = await snsProposalsPos[1].getProposalCardPos();
      expect(proposalCardPos1.length).toEqual(2);
      expect(await proposalCardPos1[0].getProposalId()).toEqual("ID: 22");
      expect(await proposalCardPos1[1].getProposalId()).toEqual("ID: 33");
    });

    it("should ignore snses w/o ballot or actionable proposals", async () => {
      const po = await renderComponent();

      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        // no proposals
        proposals: [],
        includeBallotsByCaller: true,
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [proposal0],
        // no ballots
        includeBallotsByCaller: false,
      });

      await runResolvedPromises();
      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal2,
        proposals: [proposal1, proposal2],
        includeBallotsByCaller: true,
      });

      await runResolvedPromises();
      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(1);
    });
  });
});
