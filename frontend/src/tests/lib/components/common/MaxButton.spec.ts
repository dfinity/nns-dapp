/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import MaxButton from "../../../../lib/components/common/MaxButton.svelte";

describe("MaxButton", () => {
  it("should render a button", () => {
    const { container } = render(MaxButton);
    expect(container.querySelector("button")).toBeInTheDocument();
  });

  it("should render an icon", () => {
    const { queryByTestId } = render(MaxButton);
    expect(queryByTestId("icon-subdirectory")).toBeInTheDocument();
  });

  it("should trigger on click event", (done) => {
    const { container, component } = render(MaxButton);
    component.$on("click", () => done());
    const buttonElement = container.querySelector("button");
    buttonElement && fireEvent.click(buttonElement);
  });
});
