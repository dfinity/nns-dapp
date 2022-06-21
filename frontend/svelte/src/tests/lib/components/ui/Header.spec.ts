/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import HeaderTest from "./HeaderTest.svelte";

describe("Header-ui", () => {
  it("should render slotted header", () => {
    const { getByTestId } = render(HeaderTest);

    expect(getByTestId("header-test-slot")).not.toBeNull();
  });
});
