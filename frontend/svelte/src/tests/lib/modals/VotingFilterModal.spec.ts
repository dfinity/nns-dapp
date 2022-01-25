/**
 * @jest-environment jsdom
 */

import { Topics, VotingFilterModalProps } from "../../../lib/types/voting";
import { fireEvent, render } from "@testing-library/svelte";
import VotingFilterModal from "../../../lib/modals/VotingFilterModal.svelte";

const en = require("../../../lib/i18n/en.json");

describe("VotingFilterModal", () => {
  const props: { props: VotingFilterModalProps } = {
    props: { key: "topics", filters: Topics },
  };

  it("should display modal", () => {
    const { container } = render(VotingFilterModal, {
      props,
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render title", () => {
    const { getByText } = render(VotingFilterModal, {
      props,
    });

    expect(getByText(en.voting.topics)).toBeInTheDocument();
  });

  it("should render checkboxes", () => {
    const { getByText } = render(VotingFilterModal, {
      props,
    });

    Object.values(Topics).forEach((key: string) =>
      expect(getByText(en.topics[key])).toBeInTheDocument()
    );
  });

  it("should forward close modal event", (done) => {
    const { container, component } = render(VotingFilterModal, {
      props,
    });

    component.$on("nnsClose", (e) => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector("button");
    fireEvent.click(button);
  });
});
