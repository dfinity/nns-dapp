/**
 * @jest-environment jsdom
 */

import TextInputForm from "$lib/components/common/TextInputForm.svelte";
import { clickByTestId } from "$tests/utils/utils.test-utils";
import { render } from "@testing-library/svelte";

describe("TextInputForm", () => {
  const mandatoryProps = {
    placeholderLabelKey: "test",
  };

  it("should render an input and a button", () => {
    const { getByTestId } = render(TextInputForm, {
      props: mandatoryProps,
    });

    expect(getByTestId("confirm-text-input-screen-button")).toBeInTheDocument();
    expect(getByTestId("input-ui-element")).toBeInTheDocument();
  });

  it("should render text in the input field", () => {
    const text = "test";
    const { getByTestId } = render(TextInputForm, {
      props: { ...mandatoryProps, text },
    });

    expect((getByTestId("input-ui-element") as HTMLInputElement).value).toBe(
      text
    );
  });

  it("should render an disabled button if disabled is passed", async () => {
    const { getByTestId } = render(TextInputForm, {
      props: { ...mandatoryProps, disabledConfirm: true },
    });

    expect(
      getByTestId("confirm-text-input-screen-button").hasAttribute("disabled")
    ).toBeTruthy();
  });

  it("should render an disabled input while busy", async () => {
    const { getByTestId } = render(TextInputForm, {
      props: { ...mandatoryProps, busy: true },
    });

    expect(
      getByTestId("input-ui-element").hasAttribute("disabled")
    ).toBeTruthy();
  });

  it("should render a required input by default", async () => {
    const { getByTestId } = render(TextInputForm, {
      props: { ...mandatoryProps },
    });

    expect(getByTestId("input-ui-element").hasAttribute("required")).toBe(true);
  });

  it("should not render a required input", async () => {
    const { getByTestId } = render(TextInputForm, {
      props: { ...mandatoryProps, required: false },
    });

    expect(getByTestId("input-ui-element").hasAttribute("required")).toBe(
      false
    );
  });

  it("should not render the error message", async () => {
    const errorMessage = "This is a test error";
    const { getByText } = render(TextInputForm, {
      props: { ...mandatoryProps, errorMessage },
    });

    expect(getByText(errorMessage)).toBeInTheDocument();
  });

  it("should trigger nnsClose when cancel is clicked", () => {
    const { getByTestId, component } = render(TextInputForm, {
      props: mandatoryProps,
    });

    const callback = jest.fn();
    component.$on("nnsClose", callback);
    clickByTestId(getByTestId, "cancel");
    expect(callback).toHaveBeenCalled();
  });

  it("should trigger nnsConfirmText when confirm is clicked", () => {
    const { getByTestId, component } = render(TextInputForm, {
      props: mandatoryProps,
    });

    const callback = jest.fn();
    component.$on("nnsConfirmText", callback);
    clickByTestId(getByTestId, "confirm-text-input-screen-button");
    expect(callback).toHaveBeenCalled();
  });
});
