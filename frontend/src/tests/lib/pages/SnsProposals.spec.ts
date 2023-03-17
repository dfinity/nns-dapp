/**
 * @jest-environment jsdom
 */

import * as governanceApi from "$lib/api/sns-governance.api";
import SnsProposals from "$lib/pages/SnsProposals.svelte";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import {
  createSnsProposal,
  mockSnsProposal,
} from "$tests/mocks/sns-proposals.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { SnsProposalDecisionStatus, SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/sns-governance.api");

const blockedApiPaths = ["$lib/api/sns-governance.api"];

describe("SnsProposals", () => {
  blockAllCallsTo(blockedApiPaths);

  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  const rootCanisterId = mockPrincipal;
  const nervousFunction = nervousSystemFunctionMock;
  const proposal = {
    ...mockSnsProposal,
    action: nervousFunction.id,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    snsProposalsStore.reset();
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
    // Reset to default value
    page.mock({ data: { universe: rootCanisterId.toText() } });
  });

  describe("logged in user", () => {
    const proposals = [proposal];
    beforeEach(() => {
      jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockResolvedValue([nervousFunction]);
    });

    describe("Matching results", () => {
      beforeEach(() => {
        jest
          .spyOn(governanceApi, "queryProposals")
          .mockResolvedValue(proposals);
      });

      it("should load nervous system functions functions", async () => {
        const { queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposal-card")).toBeInTheDocument()
        );

        expect(queryByTestId("proposal-topic").innerHTML).toMatch(
          nervousFunction.name
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
        expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
      });

      it("should not render not found text on init", () => {
        const { container } = render(SnsProposals);

        const p: HTMLParagraphElement | undefined = nothingFound(container);

        expect(p).toBeUndefined();
      });
    });

    describe("No results", () => {
      beforeEach(() => {
        jest.spyOn(governanceApi, "queryProposals").mockResolvedValue([]);
      });

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
    const proposals = [proposal];
    beforeEach(() => {
      jest.spyOn(governanceApi, "queryProposals").mockResolvedValue(proposals);
      jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockResolvedValue([nervousFunction]);
    });

    describe("Matching results", () => {
      it("should render proposals", async () => {
        const { queryAllByTestId, queryByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(queryByTestId("proposals-loading")).not.toBeInTheDocument()
        );

        expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
      });
    });
  });

  describe("filter proposals", () => {
    const proposals = [
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_OPEN,
        proposalId: BigInt(1),
      }),
      createSnsProposal({
        status: SnsProposalDecisionStatus.PROPOSAL_DECISION_STATUS_EXECUTED,
        proposalId: BigInt(2),
      }),
    ];
    beforeEach(() => {
      jest.spyOn(governanceApi, "queryProposals").mockResolvedValue(proposals);
      jest
        .spyOn(governanceApi, "getNervousSystemFunctions")
        .mockResolvedValue([nervousFunction]);
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
  });
});
