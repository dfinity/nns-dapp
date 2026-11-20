import DropdownTest from "$tests/lib/gix/components/DropdownTest.svelte";
import { clickByTestId } from "$tests/lib/gix/test-utils/utils.test-utils";
import { assertNonNullish } from "@dfinity/utils";
import { fireEvent, render } from "@testing-library/svelte";

describe("Dropdown", () => {
  const options = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];
  const props = { options };

  it("should render a select", () => {
    const { container } = render(DropdownTest, {
      props,
    });

    expect(container.querySelector("select")).toBeInTheDocument();
  });

  it("should change value", () => {
    const { container } = render(DropdownTest, {
      props,
    });

    const selectElement = container.querySelector("select");
    assertNonNullish(selectElement);

    expect(selectElement.value).toBe(options[0].value);

    fireEvent.change(selectElement, { target: { value: options[4].value } });

    expect(selectElement.value).toBe(options[4].value);
  });

  it("should allow setting an initial value", () => {
    const { value } = options[2];
    const { container } = render(DropdownTest, {
      props: { ...props, value },
    });

    const selectElement = container.querySelector("select");
    assertNonNullish(selectElement);

    expect(selectElement.value).toBe(value);
  });

  it("should bind the value", async () => {
    const { queryByTestId, container } = render(DropdownTest, { props });

    const selectElement = container.querySelector("select");
    assertNonNullish(selectElement);

    expect(selectElement.value).toBe("1");

    await clickByTestId(queryByTestId, "test");

    expect(selectElement.value).toBe("3");
  });
});
