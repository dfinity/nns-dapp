/**
 * @jest-environment jsdom
 */

import { ProposalRewardStatus, ProposalStatus, Topic } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import ProposalsFilters from "../../../../lib/components/proposals/ProposalsFilters.svelte";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../../lib/constants/proposals.constants";
import { enumsKeys } from "../../../../lib/utils/enum.utils";

const en = require("../../../../lib/i18n/en.json");

describe("ProposalsFilters", () => {
  it("should render topics filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumsKeys<Topic>({
      obj: Topic as unknown as Topic,
      values: DEFAULT_PROPOSALS_FILTERS.topics,
    }).forEach((key: string) =>
      expect(getByText(en.topics[key])).toBeInTheDocument()
    );
  });

  it("should render rewards filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumsKeys<ProposalRewardStatus>({
      obj: ProposalRewardStatus as unknown as ProposalRewardStatus,
      values: DEFAULT_PROPOSALS_FILTERS.rewards,
    }).forEach((key: string) =>
      expect(getByText(en.rewards[key])).toBeInTheDocument()
    );
  });

  it("should render proposals filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumsKeys<ProposalStatus>({
      obj: ProposalStatus as unknown as ProposalStatus,
      values: DEFAULT_PROPOSALS_FILTERS.status,
    }).forEach((key: string) =>
      expect(getByText(en.status[key])).toBeInTheDocument()
    );
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
