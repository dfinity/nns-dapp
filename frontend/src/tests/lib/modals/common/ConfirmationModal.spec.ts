import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
import en from "$tests/mocks/i18n.mock";
import { fireEvent, render } from "@testing-library/svelte";
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

  it("should provide custom yesLabel", () => {
    const yesLabel = "yes label for test";
    const { getByText, component } = render(ConfirmationModal, {
      props: {
        yesLabel,
      },
    });
    const spyNnsConfirm = vi.fn();
    component.$on("nnsConfirm", spyNnsConfirm);

    expect(spyNnsConfirm).toBeCalledTimes(0);
    fireEvent.click(getByText(yesLabel));
    expect(spyNnsConfirm).toBeCalledTimes(1);
  });

  it("should trigger nnsClose", () =>
    new Promise<void>((done) => {
      const { getByText, component } = render(ConfirmationModal);
      component.$on("nnsClose", () => done());
      fireEvent.click(getByText(noButtonText));
    }));

  it("should trigger nnsConfirm", () =>
    new Promise<void>((done) => {
      const { getByText, component } = render(ConfirmationModal);
      component.$on("nnsConfirm", () => done());
      fireEvent.click(getByText(yesButtonText));
    }));
});
