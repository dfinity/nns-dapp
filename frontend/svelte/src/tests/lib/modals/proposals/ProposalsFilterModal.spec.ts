/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import { DEFAULT_PROPOSALS_FILTERS } from "../../../../lib/constants/proposals.constants";
import ProposalsFilterModal from "../../../../lib/modals/proposals/ProposalsFilterModal.svelte";
import { proposalsFiltersStore } from "../../../../lib/stores/proposals.store";
import type { ProposalsFilterModalProps } from "../../../../lib/types/proposals";
import { enumKeys } from "../../../../lib/utils/enum.utils";
import en from "../../../mocks/i18n.mock";

describe("ProposalsFilterModal", () => {
  const props: { props: ProposalsFilterModalProps } = {
    props: {
      category: "topics",
      filters: Topic,
      selectedFilters: DEFAULT_PROPOSALS_FILTERS.topics,
    },
  };

  it("should display modal", () => {
    const { container } = render(ProposalsFilterModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(ProposalsFilterModal, {
      props,
    });

    expect(getByText(en.voting.topics)).toBeInTheDocument();
  });

  it("should render checkboxes", () => {
    const { getByText } = render(ProposalsFilterModal, {
      props,
    });

    enumKeys(Topic)
      .filter((key: string) => key !== "Unspecified")
      .forEach((key: string) =>
        expect(getByText(en.topics[key])).toBeInTheDocument()
      );
  });

  it("should not render filter Unspecified", () => {
    const { getByText } = render(ProposalsFilterModal, {
      props,
    });

    expect(() => getByText(en.topics.Unspecified)).toThrow();
  });

  it("should forward close modal event", (done) => {
    const { container, component } = render(ProposalsFilterModal, {
      props,
    });

    component.$on("nnsClose", () => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector(
      "button:first-of-type"
    );

    button && fireEvent.click(button);
  });

  it("should filter filters", async () => {
    const { container } = render(ProposalsFilterModal, {
      props,
    });

    const firstInput = container.querySelector(
      "div.content div.checkbox:first-of-type input"
    ) as HTMLInputElement;
    fireEvent.click(firstInput);
    await waitFor(() => expect(firstInput.checked).toBeTruthy());

    const secondInput = container.querySelector(
      "div.content div.checkbox:nth-child(2) input"
    ) as HTMLInputElement;
    fireEvent.click(secondInput);
    await waitFor(() => expect(secondInput.checked).toBeTruthy());

    const button: HTMLButtonElement | null = container.querySelector(
      "div.wrapper > button"
    );
    button && (await fireEvent.click(button));

    const selectedTopics = get(proposalsFiltersStore).topics;

    expect(selectedTopics).toEqual([...DEFAULT_PROPOSALS_FILTERS.topics, 1, 2]);
  });
});
