/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import MenuItems from "../../../../lib/components/common/MenuItems.svelte";
import en from "../../../mocks/i18n.mock";

describe("MenuItems", () => {
  const shouldRenderMenuItem = ({
    context,
    labelKey,
  }: {
    context: string;
    labelKey: string;
  }) => {
    const { getByTestId } = render(MenuItems);
    const link = getByTestId(`menuitem-${context}`) as HTMLElement;
    expect(link).not.toBeNull();
    expect(link).toBeVisible();
    expect(link.textContent?.trim()).toEqual(en.navigation[labelKey]);
  };

  it("should render accounts menu item", () =>
    shouldRenderMenuItem({ context: "accounts", labelKey: "tokens" }));
  it("should render neurons menu item", () =>
    shouldRenderMenuItem({ context: "neurons", labelKey: "neurons" }));
  it("should render voting menu item", () =>
    shouldRenderMenuItem({ context: "proposals", labelKey: "voting" }));
  it("should render canisters menu item", () =>
    shouldRenderMenuItem({ context: "canisters", labelKey: "canisters" }));

  it("should not render a get icps feature", async () => {
    const renderResult = render(MenuItems);

    const { getByTestId } = renderResult;

    expect(() => getByTestId("get-icp-button")).toThrow();
  });
});
