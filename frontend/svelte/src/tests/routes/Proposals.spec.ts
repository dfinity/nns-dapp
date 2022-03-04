/**
 * @jest-environment jsdom
 */

import { GovernanceCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { proposalsStore } from "../../lib/stores/proposals.store";
import Proposals from "../../routes/Proposals.svelte";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import {
  mockEmptyProposalsStoreSubscribe,
  MockGovernanceCanister,
  mockProposals,
  mockProposalsStoreSubscribe,
} from "../mocks/proposals.store.mock";

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const en = require("../../lib/i18n/en.json") as I18n;

describe("Proposals", () => {
  const nothingFound = (
    container: HTMLElement
  ): HTMLParagraphElement | undefined =>
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === en.voting.nothing_found
    )[0];

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  describe("Matching results", () => {
    const mockGovernanceCanister: MockGovernanceCanister =
      new MockGovernanceCanister(mockProposals);

    const mockLoadProposals = () =>
      jest
        .spyOn(proposalsStore, "subscribe")
        .mockImplementation(mockProposalsStoreSubscribe);

    beforeEach(() =>
      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation((): GovernanceCanister => mockGovernanceCanister)
    );

    it("should render a description", () => {
      const { getByText } = render(Proposals);

      expect(
        getByText(
          "The Internet Computer network runs under the control of the Network Nervous System",
          { exact: false }
        )
      ).toBeInTheDocument();
    });

    it("should render filters", () => {
      const { getByText } = render(Proposals);

      expect(getByText("Topics")).toBeInTheDocument();
      expect(getByText("Reward Status")).toBeInTheDocument();
      expect(getByText("Proposal Status")).toBeInTheDocument();
      expect(
        getByText('Hide "Open" proposals', {
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it("should render a spinner while searching proposals", () => {
      const { container } = render(Proposals);

      expect(container.querySelector("div.spinner")).not.toBeNull();
    });

    it("should render proposals", () => {
      mockLoadProposals();

      const { getByText } = render(Proposals);

      expect(getByText(mockProposals[0].proposal.title)).toBeInTheDocument();
      expect(getByText(mockProposals[1].proposal.title)).toBeInTheDocument();
    });

    it("should not render not found text on init", () => {
      const { container } = render(Proposals);

      const p: HTMLParagraphElement | undefined = nothingFound(container);

      expect(p).toBeUndefined();
    });
  });

  describe("No results", () => {
    const mockGovernanceCanister: MockGovernanceCanister =
      new MockGovernanceCanister([]);

    beforeEach(() =>
      jest
        .spyOn(GovernanceCanister, "create")
        .mockImplementation((): GovernanceCanister => mockGovernanceCanister)
    );

    it("should render not found text", async () => {
      jest
        .spyOn(proposalsStore, "subscribe")
        .mockImplementation(mockEmptyProposalsStoreSubscribe);

      const { container } = render(Proposals);

      await waitFor(() => {
        const p: HTMLParagraphElement | undefined = nothingFound(container);
        expect(p).not.toBeUndefined();
      });
    });
  });
});
