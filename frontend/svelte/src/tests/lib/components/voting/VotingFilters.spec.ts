/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import VotingFilters from "../../../../lib/components/voting/VotingFilters.svelte";
import { Proposals, Rewards, Topics } from "../../../../lib/types/voting";

const en = require("../../../../lib/i18n/en.json");

describe("VotingFilters", () => {
  it("should render topics filters", () => {
    const { getByText } = render(VotingFilters);

    Object.values(Topics).forEach((key: string) =>
      expect(getByText(en.topics[key])).toBeInTheDocument()
    );
  });

  it("should render rewards filters", () => {
    const { getByText } = render(VotingFilters);

    Object.values(Rewards).forEach((key: string) =>
      expect(getByText(en.rewards[key])).toBeInTheDocument()
    );
  });

  it("should render proposals filters", () => {
    const { getByText } = render(VotingFilters);

    Object.values(Proposals).forEach((key: string) =>
      expect(getByText(en.proposals[key])).toBeInTheDocument()
    );
  });

  it("should render a checkbox", () => {
    const { container } = render(VotingFilters);

    const input: HTMLInputElement | null = container.querySelector("input");

    expect(input).not.toBeNull();
    expect(input.getAttribute("type")).toEqual("checkbox");
    expect(input.getAttribute("id")).toEqual("hide-unavailable-proposals");
  });

  it("should set a ref to the checkbox", () => {
    const { container } = render(VotingFilters);

    const div: HTMLDivElement | null = container.querySelector(
      "div.checkbox.hide-unavailable-proposals"
    );

    expect(div).not.toBeNull();
  });
});
