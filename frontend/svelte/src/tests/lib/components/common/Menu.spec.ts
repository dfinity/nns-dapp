/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Menu from "../../../../lib/components/common/Menu.svelte";

describe("Menu", () => {
  it("should not render a get icps feature", () => {
    const { getByTestId } = render(Menu);
    expect(() => getByTestId("get-icp-button")).toThrow();
  });
});
