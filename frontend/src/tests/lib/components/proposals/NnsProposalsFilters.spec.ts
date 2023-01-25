/**
 * @jest-environment jsdom
 */

import NnsProposalsFilters from "$lib/components/proposals/NnsProposalsFilters.svelte";
import {
  DEFAULT_PROPOSALS_FILTERS,
  DEPRECATED_TOPICS,
} from "$lib/constants/proposals.constants";
import { authStore } from "$lib/stores/auth.store";
import { proposalsFiltersStore } from "$lib/stores/proposals.store";
import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "$lib/types/proposals";
import { enumSize } from "$lib/utils/enum.utils";
import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";

describe("NnsProposalsFilters", () => {
  const shouldRenderFilter = ({
    container,
    activeFilters,
    totalFilters,
    text,
  }: {
    container: HTMLElement;
    activeFilters: number;
    totalFilters: number;
    text: string;
  }) => {
    const buttonText = `${text} (${activeFilters}/${totalFilters})`;

    const buttons = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent === buttonText
    );

    expect(buttons?.length).toEqual(1);
  };

  describe("default filters", () => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    it("should render topics filters", () => {
      const { container } = render(NnsProposalsFilters);

      const nonShownTopicsLength = [
        PROPOSAL_FILTER_UNSPECIFIED_VALUE,
        ...DEPRECATED_TOPICS,
      ].length;

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.topics.length,
        totalFilters: enumSize(Topic) - nonShownTopicsLength,
        text: en.voting.topics,
      });
    });

    it("should render rewards filters", () => {
      const { container } = render(NnsProposalsFilters);

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.rewards.length,
        totalFilters: enumSize(ProposalRewardStatus) - 1,
        text: en.voting.rewards,
      });
    });

    it("should render proposals filters", () => {
      const { container } = render(NnsProposalsFilters);

      shouldRenderFilter({
        container,
        activeFilters: DEFAULT_PROPOSALS_FILTERS.status.length,
        totalFilters: enumSize(ProposalStatus) - 1,
        text: en.voting.status,
      });
    });

    describe("signed in", () => {
      beforeAll(() => {
        authStoreMock.next({
          identity: mockIdentity,
        });
      });

      it("should render a checkbox", () => {
        const { container } = render(NnsProposalsFilters);

        const input: HTMLInputElement | null = container.querySelector("input");

        expect(input?.getAttribute("type")).toEqual("checkbox");
        expect(input?.getAttribute("id")).toEqual("hide-unavailable-proposals");
      });
    });

    describe("not signed in", () => {
      beforeAll(() => {
        authStoreMock.next({
          identity: undefined,
        });
      });

      it("should not render a checkbox", () => {
        const { getByTestId } = render(NnsProposalsFilters);

        expect(() => getByTestId("hide-unavailable-proposals")).toThrow();
      });
    });
  });

  describe("custom filter selection", () => {
    afterEach(() => {
      proposalsFiltersStore.reset();
    });

    it("should not count deprecated selected filters in the count", () => {
      const activeFilters = [
        Topic.SnsDecentralizationSale,
        Topic.SnsAndCommunityFund,
        Topic.ExchangeRate,
      ];
      proposalsFiltersStore.filterTopics(activeFilters);

      const { container } = render(NnsProposalsFilters);

      const nonShownTopicsLength = [
        PROPOSAL_FILTER_UNSPECIFIED_VALUE,
        ...DEPRECATED_TOPICS,
      ].length;

      shouldRenderFilter({
        container,
        // Should NOT count deprecated SnsDecentralizationSale topic
        activeFilters: activeFilters.length - 1,
        totalFilters: enumSize(Topic) - nonShownTopicsLength,
        text: en.voting.topics,
      });
    });
  });
});
