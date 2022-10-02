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
import { clickByTestId } from "../../testHelpers/clickByTestId";

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
    const { queryAllByTestId, queryByTestId } = render(ProposalsFilterModal, {
      props,
    });

    const inputs = queryAllByTestId("checkbox") as HTMLInputElement[];
    const firstInput = inputs[0];
    fireEvent.click(firstInput);
    await waitFor(() => expect(firstInput.checked).toBeTruthy());

    const secondInput = inputs[1];
    fireEvent.click(secondInput);
    await waitFor(() => expect(secondInput.checked).toBeTruthy());

    await clickByTestId(queryByTestId, "apply-proposals-filter");

    const selectedTopics = get(proposalsFiltersStore).topics;

    expect(selectedTopics).toEqual([...DEFAULT_PROPOSALS_FILTERS.topics, 1, 2]);
  });
});
