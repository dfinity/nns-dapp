/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import Dropdown from "../../../../lib/components/ui/Dropdown.svelte";
import { clickByTestId } from "../../testHelpers/clickByTestId";
import DropdownTest from "./DropdownTest.svelte";

describe("Dropdown", () => {
  const name = "dropdown-name";
  const options = [
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ];
  const value = options[2].value;
  const props = { value, name, options };

  it("should render a select", () => {
    const { container } = render(Dropdown, {
      props,
    });

    expect(container.querySelector("select")).toBeInTheDocument();
  });

  it("should change value", async () => {
    const { container } = render(Dropdown, {
      props,
    });

    const selectElement = container.querySelector("select");
    selectElement && expect(selectElement.value).toBe(value);

    selectElement &&
      fireEvent.change(selectElement, { target: { value: options[4].value } });

    selectElement && expect(selectElement.value).toBe(options[4].value);
  });

  it("should bind the value", async () => {
    const { queryByTestId, container } = render(DropdownTest);

    const selectElement = container.querySelector("select");
    selectElement && expect(selectElement.value).toBe("1");

    await clickByTestId(queryByTestId, "test");
    selectElement && expect(selectElement.value).toBe("3");
  });
});
