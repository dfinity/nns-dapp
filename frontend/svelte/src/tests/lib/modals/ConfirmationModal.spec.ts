/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import ConfirmationModal from "../../../lib/modals/ConfirmationModal.svelte";
import en from "../../mocks/i18n.mock";
import ConfirmationModalTest from "./ConfirmationModalTest.svelte";

const yesButtonText = en.core.confirm_yes;
const noButtonText = en.core.confirm_no;

describe("ConfirmationModal", () => {
  it("should render content", () => {
    const { getByText } = render(ConfirmationModalTest);
    expect(getByText("modal content")).toBeInTheDocument();
  });

  it("should have buttons", () => {
    const { getByText } = render(ConfirmationModal);
    expect(getByText(yesButtonText)).toBeInTheDocument();
    expect(getByText(noButtonText)).toBeInTheDocument();
  });

  it("should trigger nnsClose", (done) => {
    const { getByText, component } = render(ConfirmationModal);
    component.$on("nnsClose", () => done());
    fireEvent.click(getByText(noButtonText));
  });

  it("should trigger nnsConfirm", (done) => {
    const { getByText, component } = render(ConfirmationModal);
    component.$on("nnsConfirm", () => done());
    fireEvent.click(getByText(yesButtonText));
  });
});
