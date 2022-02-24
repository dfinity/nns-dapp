/**
 * @jest-environment jsdom
 */

import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalsFilters from "../../../../lib/components/proposals/ProposalsFilters.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../../lib/constants/proposals.constants";
import { enumSize } from "../../../../lib/utils/enum.utils";

const en = require("../../../../lib/i18n/en.json");

describe("ProposalsFilters", () => {
  const shouldRenderFilter = ({
    container,
    activeFilters,
    totalFilters,
  }: {
    container: HTMLElement;
    activeFilters: number;
    totalFilters: number;
  }) => {
    const buttonText = `${en.voting.status} (${activeFilters}/${totalFilters})`;

    const button = Array.from(container.querySelectorAll("button")).filter(
      (btn) => btn.textContent === buttonText
    );

    expect(button).not.toBeNull();
  };

  it("should render topics filters", () => {
    const { container } = render(ProposalsFilters);

    shouldRenderFilter({
      container,
      activeFilters: DEFAULT_PROPOSALS_FILTERS.topics.length,
      totalFilters: enumSize(Topic),
    });
  });

  it("should render rewards filters", () => {
    const { container } = render(ProposalsFilters);

    shouldRenderFilter({
      container,
      activeFilters: DEFAULT_PROPOSALS_FILTERS.rewards.length,
      totalFilters: enumSize(ProposalRewardStatus),
    });
  });

  it("should render proposals filters", () => {
    const { container } = render(ProposalsFilters);

    shouldRenderFilter({
      container,
      activeFilters: DEFAULT_PROPOSALS_FILTERS.status.length,
      totalFilters: enumSize(ProposalStatus),
    });
  });

  it("should render a checkbox", () => {
    const { container } = render(ProposalsFilters);

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input).not.toBeNull();
    expect(input.getAttribute("type")).toEqual("checkbox");
    expect(input.getAttribute("id")).toEqual("hide-unavailable-proposals");
  });

  it("should set a ref to the checkbox", () => {
    const { container } = render(ProposalsFilters);

    const div: HTMLDivElement | null = container.querySelector(
      "div.checkbox.hide-unavailable-proposals"
    );

    expect(div).not.toBeNull();
  });
});
