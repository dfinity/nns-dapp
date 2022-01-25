/**
 * @jest-environment jsdom
 */

import {Topics, VotingFilterModalProps} from '../../../lib/types/voting';
import { fireEvent, render } from "@testing-library/svelte";
import VotingFilterModal from "../../../lib/modals/VotingFilterModal.svelte";

describe("VotingFilterModal", () => {
  const props: {props: VotingFilterModalProps} = { props: { title: "Test", filters: Topics } };

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

    expect(getByText("Test")).toBeInTheDocument();
  });

  it("should render checkboxed", () => {
    const { getByText } = render(VotingFilterModal, {
      props,
    });

    Object.values(Topics).forEach((text: string) =>
      expect(getByText(text)).toBeInTheDocument()
    );
  });

  it("should forward close modal event", (done) => {
    const { container, component } = render(VotingFilterModal, {
      props,
    });

    component.$on("close", (e) => {
      done();
    });

    const button: HTMLButtonElement | null = container.querySelector("button");
    fireEvent.click(button);
  });
});
