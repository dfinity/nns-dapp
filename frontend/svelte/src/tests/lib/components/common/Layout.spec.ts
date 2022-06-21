/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Layout from "../../../../lib/components/common/Layout.svelte";
import en from "../../../mocks/i18n.mock";

describe("Layout", () => {
  it("should render a menu button", () => {
    const { getByTestId } = render(Layout);
    const button = getByTestId("menu");
    expect(button).not.toBeNull();
    expect(button).toBeVisible();
    expect(button.getAttribute("aria-label")).toEqual(en.header.menu);
  });
});
