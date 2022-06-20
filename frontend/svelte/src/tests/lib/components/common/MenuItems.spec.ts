/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Nav from "../../../../lib/components/common/MenuItems.svelte";
import en from "../../../mocks/i18n.mock";

describe("MenuItems", () => {
  const shouldRenderMenuItem = (context: string) => {
    const { getByTestId } = render(Nav);
    const link = getByTestId(`menuitem-${context}`) as HTMLElement;
    expect(link).not.toBeNull();
    expect(link).toBeVisible();
    expect(link.textContent?.trim()).toEqual(en.navigation[context]);
  };

  it("should render accounts menu item", () =>
    shouldRenderMenuItem("accounts"));
  it("should render neurons menu item", () => shouldRenderMenuItem("accounts"));
  it("should render voting menu item", () => shouldRenderMenuItem("accounts"));
  it("should render canisters menu item", () =>
    shouldRenderMenuItem("accounts"));
});
