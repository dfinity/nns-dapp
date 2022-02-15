/**
 * @jest-environment jsdom
 */

import { Topic } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import ProposalsFilterModal from "../../../lib/modals/ProposalsFilterModal.svelte";
import type { ProposalsFilterModalProps } from "../../../lib/types/proposals";
import { enumKeys } from "../../../lib/utils/enum.utils";

const en = require("../../../lib/i18n/en.json");

describe("ProposalsFilterModal", () => {
  const props: { props: ProposalsFilterModalProps } = {
    props: {
      category: "topics",
      filters: Topic,
      selectedFilters: enumKeys(Topic).map((key: string) => Topic[key]),
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

    enumKeys(Topic).forEach((key: string) =>
      expect(getByText(en.topics[key])).toBeInTheDocument()
    );
  });

  it("should forward close modal event", (done) => {
    const { container, component } = render(ProposalsFilterModal, {
      props,
    });

    component.$on("nnsClose", (e) => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector("button");
    fireEvent.click(button);
  });
});
