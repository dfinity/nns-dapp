/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import TooltipTest from "./TooltipTest.svelte";

describe("Tooltip", () => {
  it("should render target content", () => {
    const { container } = render(TooltipTest);
    expect(container.querySelector("p")).toBeInTheDocument();
    expect(container.querySelector("p").innerHTML).toBe("content");
  });

  it("should render aria-describedby and relevant id", () => {
    const { container } = render(TooltipTest);
    expect(
      container.querySelector("[aria-describedby='tid']")
    ).toBeInTheDocument();
    expect(container.querySelector("[id='tid']")).toBeInTheDocument();
  });
});
