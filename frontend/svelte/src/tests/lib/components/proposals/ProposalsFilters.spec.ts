/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProposalsFilters from "../../../../lib/components/proposals/ProposalsFilters.svelte";
import { ProposalStatus, ProposalRewardStatus, Topic } from "@dfinity/nns";
import { enumKeys } from "../../../../lib/utils/enum.utils";

const en = require("../../../../lib/i18n/en.json");

describe("ProposalsFilters", () => {
  it("should render topics filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumKeys(Topic).forEach((key: string) =>
      expect(getByText(en.topics[key])).toBeInTheDocument()
    );
  });

  it("should render rewards filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumKeys(ProposalRewardStatus).forEach((key: string) =>
      expect(getByText(en.rewards[key])).toBeInTheDocument()
    );
  });

  it("should render proposals filters", () => {
    const { getByText } = render(ProposalsFilters);

    enumKeys(ProposalStatus).forEach((key: string) =>
      expect(getByText(en.proposals[key])).toBeInTheDocument()
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
