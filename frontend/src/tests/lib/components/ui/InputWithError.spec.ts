import InputWithError from "$lib/components/ui/InputWithError.svelte";
import { InputWithErrorPo } from "$tests/page-objects/InputWithError.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Input", () => {
  const props = { name: "name", placeholderLabelKey: "test.placeholder" };

  const renderComponent = (props) => {
    const { container } = render(InputWithError, { props });
    return InputWithErrorPo.under({
      element: new JestPageObjectElement(container),
    });
  };

  it("should render an input", async () => {
    const po = renderComponent(props);
    expect(await po.getTextInputPo().isPresent()).toBe(true);
  });

  it("should render an error message", async () => {
    const errorMessage = "test error";
    const po = renderComponent({
      ...props,
      errorMessage,
    });

    expect(await po.getErrorMessage()).toBe(errorMessage);
  });

  it("should render an error outline for an error message", async () => {
    const errorMessage = "test error";
    const po = renderComponent({
      ...props,
      errorMessage,
    });

    expect(await po.hasErrorOutline()).toBe(true);
  });

  it("should render a warning message", async () => {
    const warningMessage = "test warning";
    const po = renderComponent({
      ...props,
      warningMessage,
    });

    expect(await po.getErrorMessage()).toBe(warningMessage);
  });

  it("should not render an error outline for a warning message", async () => {
    const warningMessage = "test warning";
    const po = renderComponent({
      ...props,
      warningMessage,
    });

    expect(await po.hasErrorOutline()).toBe(false);
  });

  it("should not render a warning message with an error message", async () => {
    const errorMessage = "test error";
    const warningMessage = "test warning";
    const po = renderComponent({
      ...props,
      errorMessage,
      warningMessage,
    });

    expect(await po.getErrorMessage()).toBe(errorMessage);
    expect(await po.hasErrorOutline()).toBe(true);
  });
});
