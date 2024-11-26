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
import { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { beforeEach } from "vitest";

describe("ActionableProposals", () => {
  const renderComponent = async () => {
    const { container } = render(ActionableProposals);
    await runResolvedPromises();
    return ActionableProposalsPo.under(new JestPageObjectElement(container));
  };
  const principal0 = principal(0);
  const principal1 = principal(1);
  const principal2 = principal(2);
  const snsProject0 = {
    lifecycle: SnsSwapLifecycle.Committed,
    projectName: "Sns Project 0",
    rootCanisterId: principal0,
  };
  const snsProject1 = {
    lifecycle: SnsSwapLifecycle.Committed,
    projectName: "Sns Project 1",
    rootCanisterId: principal1,
  };
  const snsProject2 = {
    lifecycle: SnsSwapLifecycle.Committed,
    projectName: "Sns Project 2",
    rootCanisterId: principal2,
  };
  const createProposal = (proposalId: bigint): SnsProposalData =>
    createSnsProposal({
      status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
      rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      proposalId,
    });
  const snsProposal0 = createProposal(11n);
  const snsProposal1 = createProposal(22n);
  const snsProposal2 = createProposal(33n);

  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();

    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Proposals,
    });
  });

  describe("Actionable Nns proposals", () => {
    const nnsProposal1: ProposalInfo = { ...mockProposalInfo, id: 11n };
    const nnsProposal2: ProposalInfo = { ...mockProposalInfo, id: 22n };

    beforeEach(() => {
      // Ensure Sns proposals are loaded to avoid rendering skeletons
      setSnsProjects([
        {
          lifecycle: SnsSwapLifecycle.Committed,
          rootCanisterId: principal(0),
        },
      ]);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal(0),
        proposals: [],
      });
    });

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

    it("should have actionable query parameter in card href", async () => {
      actionableNnsProposalsStore.setProposals([nnsProposal1]);

      const po = await renderComponent();
      const firstCardPo = (
        await po.getActionableNnsProposalsPo().getProposalCardPos()
      )[0];
      expect(await firstCardPo.getProposalId()).toEqual("ID: 11");
      expect(await firstCardPo.getCardHref()).toEqual(
        "/proposal/?u=qhbym-qaaaa-aaaaa-aaafq-cai&proposal=11&actionable"
      );
    });
  });

  describe("Actionable Sns proposals", () => {
    beforeEach(() => {
      // Ensure Nns proposals are loaded to avoid rendering skeletons
      actionableNnsProposalsStore.setProposals([]);
    });

    it("should render actionable Sns proposals", async () => {
      setSnsProjects([snsProject0, snsProject1]);
      const po = await renderComponent();

      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [snsProposal0],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [snsProposal1, snsProposal2],
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

    it("should have actionable query parameter in card href", async () => {
      setSnsProjects([snsProject0]);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [snsProposal0],
      });
      const po = await renderComponent();
      const snsProposalsPos = await po
        .getActionableSnses()
        .getActionableSnsProposalsPos();
      expect(snsProposalsPos).toHaveLength(1);
      expect(
        await (await snsProposalsPos[0].getProposalCardPos())[0].getCardHref()
      ).toEqual("/proposal/?u=g3pce-2iaae&proposal=11&actionable");
    });

    it("should render proposal card links to different Snses", async () => {
      const principal0 = Principal.fromText("aaaaa-aa");
      const principal1 = Principal.fromText("aax3a-h4aaa-aaaaa-qaahq-cai");
      Principal.fromText("aaaaa-aa");
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
      ]);
      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        proposals: [snsProposal0],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [snsProposal1],
      });
      const po = await renderComponent();

      const snsProposalsPos = await po
        .getActionableSnses()
        .getActionableSnsProposalsPos();
      expect(snsProposalsPos).toHaveLength(2);
      expect(
        await (await snsProposalsPos[0].getProposalCardPos())[0].getCardHref()
      ).toEqual("/proposal/?u=aaaaa-aa&proposal=11&actionable");
      expect(
        await (await snsProposalsPos[1].getProposalCardPos())[0].getCardHref()
      ).toEqual(
        "/proposal/?u=aax3a-h4aaa-aaaaa-qaahq-cai&proposal=22&actionable"
      );
    });

    it("should ignore snses w/o ballot or actionable proposals", async () => {
      setSnsProjects([snsProject0, snsProject1, snsProject2]);
      const po = await renderComponent();

      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal0,
        // no proposals
        proposals: [],
      });
      actionableSnsProposalsStore.set({
        rootCanisterId: principal1,
        proposals: [snsProposal0],
        // no ballots
      });

      await runResolvedPromises();
      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(0);

      actionableSnsProposalsStore.set({
        rootCanisterId: principal2,
        proposals: [snsProposal1, snsProposal2],
      });

      await runResolvedPromises();
      expect(
        await po.getActionableSnses().getActionableSnsProposalsPos()
      ).toHaveLength(2);
    });
  });

  it("should render skeletons while loading", async () => {
    setSnsProjects([snsProject0]);
    const po = await renderComponent();

    expect(await po.hasActionableNnsProposals()).toEqual(false);
    expect(await po.hasSkeletons()).toEqual(true);

    actionableNnsProposalsStore.setProposals([{ ...mockProposalInfo }]);
    await runResolvedPromises();

    expect(await po.hasActionableNnsProposals()).toEqual(false);
    expect(await po.hasSkeletons()).toEqual(true);

    actionableSnsProposalsStore.set({
      rootCanisterId: principal0,
      proposals: [],
    });
    await runResolvedPromises();

    expect(await po.hasActionableNnsProposals()).toEqual(true);
    expect(await po.hasSkeletons()).toEqual(false);
  });

  it('should display "no actionable proposals" banner', async () => {
    setSnsProjects([snsProject0]);
    const po = await renderComponent();

    expect(await po.hasActionableEmptyBanner()).toEqual(false);

    actionableNnsProposalsStore.setProposals([]);
    actionableSnsProposalsStore.set({
      rootCanisterId: principal0,
      proposals: [],
    });
    await runResolvedPromises();

    expect(await po.hasActionableEmptyBanner()).toEqual(true);
  });
});
