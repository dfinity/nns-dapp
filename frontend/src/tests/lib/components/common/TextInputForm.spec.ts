import TextInputForm from "$lib/components/common/TextInputForm.svelte";
import { TextInputFormPo } from "$tests/page-objects/TextInputForm.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { render } from "@testing-library/svelte";

describe("TextInputForm", () => {
  const mandatoryProps = {
    placeholderLabelKey: "test",
  };

  const renderComponent = (props) => {
    const testId = props.testId ?? "text-input-form";
    const { container } = render(TextInputForm, {
      props: {
        testId,
        ...props,
      },
    });

    return TextInputFormPo.under({
      element: new JestPageObjectElement(container),
      testId,
    });
  };

  it("should render text in the input field", async () => {
    const text = "test";
    const po = renderComponent({ ...mandatoryProps, text });

    expect(await po.getTextInputPo().getValue()).toBe(text);
  });

  it("should render an disabled button if disabled is passed", async () => {
    const po = renderComponent({ ...mandatoryProps, disabledConfirm: true });

    expect(await po.getConfirmButtonPo().isDisabled()).toBe(true);
  });

  it("should render a disabled input", async () => {
    const po = renderComponent({ ...mandatoryProps, disabledInput: true });

    expect(await po.getTextInputPo().isDisabled()).toBe(true);
  });

  it("should render a required input by default", async () => {
    const po = renderComponent(mandatoryProps);

    expect(await po.getTextInputPo().isRequired()).toBe(true);
  });

  it("should not render a required input if false", async () => {
    const po = renderComponent({ ...mandatoryProps, required: false });

    expect(await po.getTextInputPo().isRequired()).toBe(false);
  });

  it("should render the error message", async () => {
    const errorMessage = "This is a test error";
    const po = renderComponent({ ...mandatoryProps, errorMessage });

    expect(await po.getErrorMessage()).toBe(errorMessage);
  });

  it("should trigger nnsClose when cancel is clicked", () => {
    const { getByTestId, component } = render(TextInputForm, {
      props: mandatoryProps,
    });

    const callback = vi.fn();
    component.$on("nnsClose", callback);
    clickByTestId(getByTestId, "cancel");
    expect(callback).toHaveBeenCalled();
  });

  it("should trigger nnsConfirmText when confirm is clicked", () => {
    const { getByTestId, component } = render(TextInputForm, {
      props: mandatoryProps,
    });

    const callback = vi.fn();
    component.$on("nnsConfirmText", callback);
    clickByTestId(getByTestId, "confirm-text-input-screen-button");
    expect(callback).toHaveBeenCalled();
  });
});
