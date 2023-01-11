/**
 * @jest-environment jsdom
 */

import SnsProposals from "$lib/pages/SnsProposals.svelte";
import { loadSnsProposals } from "$lib/services/$public/sns-proposals.services";
import { loadSnsNervousSystemFunctions } from "$lib/services/$public/sns.services";
import { snsProposalsStore } from "$lib/stores/sns-proposals.store";
import { page } from "$mocks/$app/stores";
import { render, waitFor } from "@testing-library/svelte";
import { mockPrincipal } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";
import { mockSnsProposal } from "../../mocks/sns-proposals.mock";

jest.mock("$lib/services/$public/sns.services", () => {
  return {
    loadSnsNervousSystemFunctions: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/$public/sns-proposals.services", () => {
  return {
    loadSnsProposals: jest.fn().mockResolvedValue(undefined),
  };
});

describe("SnsProposals", () => {
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  describe("logged in user", () => {
    beforeEach(() => {
      // Reset to default value
      page.mock({ data: { universe: mockPrincipal.toText() } });
    });

    afterAll(() => jest.clearAllMocks());

    describe("Matching results", () => {
      beforeEach(() => {
        snsProposalsStore.reset();
      });
      it("should load proposals and nervous system functions functions", () => {
        render(SnsProposals);

        expect(loadSnsNervousSystemFunctions).toBeCalled();
        expect(loadSnsProposals).toBeCalled();
      });

      it("should render a spinner while searching proposals", async () => {
        const { getByTestId } = render(SnsProposals);

        await waitFor(() =>
          expect(getByTestId("proposals-loading")).not.toBeNull()
        );
      });

      it("should render proposals", () => {
        const proposals = [mockSnsProposal];
        snsProposalsStore.setProposals({
          rootCanisterId: mockPrincipal,
          proposals,
          certified: true,
        });

        const { queryAllByTestId } = render(SnsProposals);

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
        // Reset to default value
        page.mock({ data: { universe: mockPrincipal.toText() } });
      });

      it("should render not found text", async () => {
        snsProposalsStore.setProposals({
          rootCanisterId: mockPrincipal,
          proposals: [],
          certified: true,
        });

        const { container } = render(SnsProposals);

        await waitFor(() => {
          const p: HTMLParagraphElement | undefined = nothingFound(container);
          expect(p).not.toBeUndefined();
        });
      });
    });
  });

  describe("when not logged in", () => {
    afterAll(() => jest.clearAllMocks());

    describe("Matching results", () => {
      beforeEach(() => snsProposalsStore.reset());

      it("should render proposals", () => {
        const proposals = [mockSnsProposal];
        snsProposalsStore.setProposals({
          rootCanisterId: mockPrincipal,
          proposals,
          certified: true,
        });

        const { queryAllByTestId } = render(SnsProposals);

        expect(queryAllByTestId("proposal-card").length).toBe(proposals.length);
      });
    });
  });
});
