import SnsProposals from "$lib/pages/SnsProposals.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsFiltersStore } from "$lib/stores/sns-filters.store";
import { snsFunctionsStore } from "$lib/stores/sns-functions.store";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { page } from "$mocks/$app/stores";
import * as fakeSnsGovernanceApi from "$tests/fakes/sns-governance-api.fake";
import {
  mockAuthStoreNoIdentitySubscribe,
  mockAuthStoreSubscribe,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { createSnsProposal } from "$tests/mocks/sns-proposals.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { AnonymousIdentity } from "@dfinity/agent";
import {
  SnsProposalDecisionStatus,
  SnsProposalRewardStatus,
  SnsSwapLifecycle,
  type SnsProposalData,
} from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/sns-governance.api");

describe("SnsProposals", () => {
  fakeSnsGovernanceApi.install();

  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  const rootCanisterId = mockPrincipal;
  const functionName = "test_function";
  const functionId = 3n;

  beforeEach(() => {
    vi.clearAllMocks();
    snsProposalsStore.reset();
    snsFunctionsStore.reset();
    snsFiltersStore.reset();
    // Reset to default value
    page.mock({ data: { universe: rootCanisterId.toText() } });
    setSnsProjects([
      {
        rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
        nervousFunctions: [
          {
            ...nervousSystemFunctionMock,
            name: functionName,
            id: functionId,
          },
        ],
      },
    ]);
  });

  describe("logged in user", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreSubscribe
      );
    });

    describe("Matching results", () => {
      beforeEach(() => {
        fakeSnsGovernanceApi.addProposalWith({
          rootCanisterId,
          action: functionId,
        });
      });

      it("should load nervous system functions", async () => {
        const { queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposal-card")).toBeInTheDocument()
        );

        expect(queryByTestId("proposal-card-heading").textContent).toMatch(
          functionName
        );
      });

      it("should load decision status filters", async () => {
        const { getByTestId, queryAllByTestId } = render(SnsProposals);

        const decisionStatusButton = getByTestId("filters-by-status");
        expect(decisionStatusButton).toBeInTheDocument();

        fireEvent.click(decisionStatusButton);

        await waitFor(() =>
          expect(getByTestId("filter-modal")).toBeInTheDocument()
        );

        expect(queryAllByTestId("checkbox").length).toBeGreaterThan(0);
      });

      it("should init types filter", async () => {
        const getFiltersStoreData = () =>
          get(snsFiltersStore)[rootCanisterId.toText()];

        expect(getFiltersStoreData()?.types).toEqual(undefined);
        render(SnsProposals);

        await waitFor(() =>
          expect(getFiltersStoreData()?.types).toEqual([
            {
              checked: true,
              id: "3",
              name: "test_function",
              value: "3",
            },
          ])
        );
      });

      it("should render a spinner while searching proposals", async () => {
        const { getByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(getByTestId("proposals-loading")).not.toBeNull()
        );
      });

      it("should render proposals", async () => {
        const { queryAllByTestId, queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );
        expect(queryAllByTestId("proposal-card").length).toBe(1);
      });

      it("should not render not found text on init", () => {
        const { container } = render(SnsProposals);

        const p: HTMLParagraphElement | undefined = nothingFound(container);

        expect(p).toBeUndefined();
      });
    });

    describe("No results", () => {
      it("should render not found text", async () => {
        const { queryByTestId, container } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );

        const p: HTMLParagraphElement | undefined = nothingFound(container);
        expect(p).not.toBeUndefined();
      });
    });
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreNoIdentitySubscribe
      );
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
      });
    });

    describe("Matching results", () => {
      it("should render proposals", async () => {
        const { queryAllByTestId, queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );

        expect(queryAllByTestId("proposal-card").length).toBe(1);
      });
    });
  });

  describe("filter proposals", () => {
    const proposals: SnsProposalData[] = [
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        proposalId: 1n,
        rewardStatus:
          SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES,
      }),
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        proposalId: 2n,
        rewardStatus: SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_SETTLED,
      }),
    ];
    beforeEach(() => {
      vi.spyOn(authStore, "subscribe").mockImplementation(
        mockAuthStoreNoIdentitySubscribe
      );
      const functionId = 3n;
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposals[0],
        action: functionId,
      });
      fakeSnsGovernanceApi.addProposalWith({
        identity: new AnonymousIdentity(),
        rootCanisterId,
        ...proposals[1],
        action: functionId,
      });
    });

    it("should filter by status", async () => {
      const { getByTestId, queryAllByTestId, queryByTestId } =
        render(SnsProposals);

      await waitFor(() =>
        expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
      );

      expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);

      const decisionStatusButton = getByTestId("filters-by-status");
      expect(decisionStatusButton).toBeInTheDocument();

      fireEvent.click(decisionStatusButton);

      await waitFor(() =>
        expect(queryByTestId("filter-modal")).toBeInTheDocument()
      );

      const checkBoxes = queryAllByTestId("checkbox");
      expect(checkBoxes.length).toBeGreaterThan(0);

      const openCheckbox = checkBoxes.find(
        (element) =>
          element.getAttribute("id") ===
          String(SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN)
      );
      expect(openCheckbox).not.toBeUndefined();

      // Select Open status checkbox
      fireEvent.click(openCheckbox);

      // Apply filters
      fireEvent.click(getByTestId("apply-filters"));

      // Wait for modal to close
      await waitFor(() =>
        expect(queryByTestId("filter-modal")).not.toBeInTheDocument()
      );

      expect(queryAllByTestId("proposal-card").length).toBe(1);
    });

    it("should filter by reward status", async () => {
      const { getByTestId, queryAllByTestId, queryByTestId } =
        render(SnsProposals);

      await waitFor(() =>
        expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
      );

      fireEvent.click(getByTestId("filters-by-rewards"));

      await waitFor(() =>
        expect(queryByTestId("filter-modal")).toBeInTheDocument()
      );

      const openCheckbox = queryAllByTestId("checkbox").find(
        (element) =>
          element.getAttribute("id") ===
          String(SnsProposalRewardStatus.PROPOSAL_REWARD_STATUS_ACCEPT_VOTES)
      );
      expect(openCheckbox).not.toBeUndefined();

      // Select Open status checkbox
      fireEvent.click(openCheckbox);

      // Apply filters
      fireEvent.click(getByTestId("apply-filters"));

      // Wait for modal to close
      await waitFor(() =>
        expect(queryByTestId("filter-modal")).not.toBeInTheDocument()
      );

      expect(queryAllByTestId("proposal-card").length).toBe(1);
    });
  });
});
