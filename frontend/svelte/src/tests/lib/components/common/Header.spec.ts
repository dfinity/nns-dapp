/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Header from "../../../../lib/components/common/Header.svelte";
import en from "../../../mocks/i18n.mock";
import HeaderTest from "./HeaderTest.svelte";

describe("Header", () => {
  it("should render an account menu button", () => {
    const { getByTestId } = render(Header);
    const button = getByTestId("account-menu");
    expect(button).not.toBeNull();
    expect(button).toBeVisible();
    expect(button.getAttribute("aria-label")).toEqual(en.header.account_menu);
  });

  it("should render slotted content", () => {
    const { getByTestId } = render(HeaderTest);

    expect(getByTestId("header-test-slot")).not.toBeNull();
  });

  it("should render slotted start", () => {
    const { getByTestId } = render(HeaderTest);

    expect(getByTestId("header-test-start-slot")).not.toBeNull();
  });
});
