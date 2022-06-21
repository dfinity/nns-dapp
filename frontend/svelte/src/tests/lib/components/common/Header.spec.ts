/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Header from "../../../../lib/components/common/Header.svelte";
import en from "../../../mocks/i18n.mock";

describe("Header", () => {
  it("should render a menu button", () => {
    const { getByTestId } = render(Header);
    const button = getByTestId("menu");
    expect(button).not.toBeNull();
    expect(button).toBeVisible();
    expect(button.getAttribute("aria-label")).toEqual(en.header.menu);
  });

  it("should render an account menu button", () => {
    const { getByTestId } = render(Header);
    const button = getByTestId("account-menu");
    expect(button).not.toBeNull();
    expect(button).toBeVisible();
    expect(button.getAttribute("aria-label")).toEqual(en.header.account_menu);
  });
});
