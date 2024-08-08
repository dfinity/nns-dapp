import * as proposalsApi from "$lib/api/proposals.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { filteredProposals } from "$lib/derived/proposals.derived";
import { actionableNnsProposalsStore } from "$lib/stores/actionable-nns-proposals.store";
import { actionableProposalsSegmentStore } from "$lib/stores/actionable-proposals-segment.store";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  generateMockProposals,
  mockProposalInfo,
  proposalActionNnsFunction21,
} from "$tests/mocks/proposal.mock";
import { createMockProposalsStoreSubscribe } from "$tests/mocks/proposals.store.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { ProposalNavigationPo } from "$tests/page-objects/ProposalNavigation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { Principal } from "@dfinity/principal";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
} from "@dfinity/sns";
import { render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import NnsProposalTest from "./NnsProposalTest.svelte";

vi.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => Promise.resolve(value),
}));

vi.mock("$lib/api/nns-dapp.api");

describe("Proposal", () => {
  blockAllCallsTo(["$lib/api/nns-dapp.api"]);

  beforeEach(() => {
    resetIdentity();
    referrerPathStore.set(undefined);
  });

  const renderProposalModern = (id = 1000n) =>
    render(NnsProposalTest, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          id,
          proposal: {
            ...mockProposalInfo.proposal,
            action: proposalActionNnsFunction21,
          },
        },
      },
    });

  beforeEach(() => {
    actionableProposalsSegmentStore.resetForTesting();
    vi.spyOn(proposalsApi, "queryProposalPayload").mockResolvedValue({});
    actionableProposalsSegmentStore.set("all");
  });

  it("should render a detail grid", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-details-grid")).toBeInTheDocument()
    );
  });

  it("should render system info", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-system-info-details")).toBeInTheDocument()
    );
  });

  it("should render proposer proposal info", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(queryByTestId("proposal-summary-title")).toBeInTheDocument()
    );
  });

  it("should render proposer proposal actions entry", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(
        queryByTestId("proposal-proposer-actions-entry-title")
      ).toBeInTheDocument()
    );
  });

  it("should render proposer proposal payload entry", async () => {
    const { queryByTestId } = renderProposalModern();
    await waitFor(() =>
      expect(
        queryByTestId("proposal-proposer-payload-entry-title")
      ).toBeInTheDocument()
    );
  });

  it("should render proposal navigation", async () => {
    vi.spyOn(filteredProposals, "subscribe").mockImplementation(
      // Reverse to mock the common order of the proposals
      createMockProposalsStoreSubscribe(generateMockProposals(10).reverse())
    );

    const { container } = renderProposalModern(5n);
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));

    expect(await po.getNextButtonPo().isPresent()).toBe(true);
    expect(await po.getNextButtonProposalId()).toEqual("4");
    expect(await po.getPreviousButtonPo().isPresent()).toBe(true);
    expect(await po.getPreviousButtonProposalId()).toEqual("6");
  });

  it("should use actionable proposals for navigation when actionable selected", async () => {
    actionableProposalsSegmentStore.set("actionable");

    // Keep "all" proposals empty to make the test fail if not using the actionable proposals
    vi.spyOn(filteredProposals, "subscribe").mockImplementation(
      createMockProposalsStoreSubscribe([])
    );
    // Set proposals with ids: 0, 1, 2
    actionableNnsProposalsStore.setProposals(generateMockProposals(3));

    const { container } = renderProposalModern(1n);
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));

    expect(await po.getNextButtonPo().isPresent()).toBe(true);
    expect(await po.getNextButtonProposalId()).toEqual("0");
    expect(await po.getPreviousButtonPo().isPresent()).toBe(true);
    expect(await po.getPreviousButtonProposalId()).toEqual("2");
  });

  it("should not render proposal navigation when on launchpad", async () => {
    vi.spyOn(filteredProposals, "subscribe").mockImplementation(
      createMockProposalsStoreSubscribe(generateMockProposals(10))
    );
    referrerPathStore.set(AppPath.Launchpad);

    const { container } = renderProposalModern(5n);
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));

    expect(await po.isPresent()).toBe(false);
  });

  it("should navigate to Sns", async () => {
    page.mock({
      data: {
        universe: OWN_CANISTER_ID_TEXT,
        routeId: AppPath.Proposal,
        actionable: true,
      },
    });
    setSnsProjects([
      {
        lifecycle: SnsSwapLifecycle.Committed,
        rootCanisterId: Principal.fromText("f7crg-kabae"),
      },
    ]);
    actionableSnsProposalsStore.set({
      rootCanisterId: Principal.fromText("f7crg-kabae"),
      proposals: [
        createSnsProposal({
          status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
          rewardStatus:
            SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
          proposalId: 33n,
        }),
      ],
    });

    actionableNnsProposalsStore.setProposals(generateMockProposals(1));

    const { container } = renderProposalModern(0n);
    const po = ProposalNavigationPo.under(new JestPageObjectElement(container));

    expect(await po.isPreviousButtonHidden()).toBe(true);
    expect(await po.isNextButtonHidden()).toBe(false);
    expect(await po.getNextButtonProposalId()).toEqual("33");

    await po.clickNext();
    expect(get(page)).toEqual({
      data: {
        actionable: "",
        proposal: "33",
        universe: "f7crg-kabae",
      },
      route: {
        id: "/(app)/proposal/",
      },
    });
  });
});
