/**
 * @jest-environment jsdom
 */

import ProposalsFilters from "$lib/components/proposals/ProposalsFilters.svelte";
import {
  DEFAULT_PROPOSALS_FILTERS,
  DEPRECATED_TOPICS,
} from "$lib/constants/proposals.constants";
import { PROPOSAL_FILTER_UNSPECIFIED_VALUE } from "$lib/types/proposals";
import { enumSize } from "$lib/utils/enum.utils";
import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";

describe("ProposalsFilters", () => {
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

  it("should render topics filters", () => {
    const { container } = render(ProposalsFilters);

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
    const { container } = render(ProposalsFilters);

    shouldRenderFilter({
      container,
      activeFilters: DEFAULT_PROPOSALS_FILTERS.rewards.length,
      totalFilters: enumSize(ProposalRewardStatus) - 1,
      text: en.voting.rewards,
    });
  });

  it("should render proposals filters", () => {
    const { container } = render(ProposalsFilters);

    shouldRenderFilter({
      container,
      activeFilters: DEFAULT_PROPOSALS_FILTERS.status.length,
      totalFilters: enumSize(ProposalStatus) - 1,
      text: en.voting.status,
    });
  });

  it("should render a checkbox", () => {
    const { container } = render(ProposalsFilters);

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input?.getAttribute("type")).toEqual("checkbox");
    expect(input?.getAttribute("id")).toEqual("hide-unavailable-proposals");
  });
});
