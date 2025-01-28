import ConfirmationModal from "$lib/modals/common/ConfirmationModal.svelte";
import ConfirmationModalTest from "$tests/lib/modals/common/ConfirmationModalTest.svelte";
import en from "$tests/mocks/i18n.mock";
import { render } from "$tests/utils/svelte.test-utils";
import { fireEvent } from "@testing-library/svelte";

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
    const spyNnsConfirm = vi.fn();
    const { getByText } = render(ConfirmationModal, {
      props: {
        yesLabel,
      },
      events: {
        nnsConfirm: spyNnsConfirm,
      },
    });

    expect(spyNnsConfirm).toBeCalledTimes(0);
    fireEvent.click(getByText(yesLabel));
    expect(spyNnsConfirm).toBeCalledTimes(1);
  });

  it("should trigger nnsClose", () =>
    new Promise<void>((done) => {
      const { getByText } = render(ConfirmationModal, {
        props: {},
        events: {
          nnsClose: () => done(),
        },
      });

      fireEvent.click(getByText(noButtonText));
    }));

  it("should trigger nnsConfirm", () =>
    new Promise<void>((done) => {
      const { getByText } = render(ConfirmationModal, {
        props: {},
        events: {
          nnsConfirm: () => done(),
        },
      });

      fireEvent.click(getByText(yesButtonText));
    }));
});
