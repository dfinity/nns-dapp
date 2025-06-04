import Copy from "$lib/components/ui/Copy.svelte";
import { ButtonPo } from "$tests/page-objects/Button.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Copy Component", () => {
  const renderComponent = (props: { value: string }) => {
    const testId = "copy-component";
    const { container } = render(Copy, props);
    return ButtonPo.under({
      element: new JestPageObjectElement(container),
      testId,
    });
  };
  const value = "test-copy";

  it("should render an accessible button", async () => {
    const po = renderComponent({ value });

    expect(await po.getAriaLabel()).toEqual(`Copy to clipboard: ${value}`);
  });

  it("should copy value to clipboard", async () => {
    Object.assign(window.navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
    const po = renderComponent({ value });

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledTimes(0);

    await po.click();

    expect(window.navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(value);
  });
});
