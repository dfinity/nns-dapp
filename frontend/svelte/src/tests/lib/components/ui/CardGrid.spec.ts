/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CardGridTest from "./CardGridTest.svelte";

describe("CardGrid", () => {
  it("should render a slot content", () => {
    const { getByText } = render(CardGridTest);
    expect(getByText("test content")).toBeInTheDocument();
  });
});
