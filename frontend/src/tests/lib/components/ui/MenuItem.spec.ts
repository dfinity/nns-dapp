/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import MenuItem from "../../../../lib/components/ui/MenuItem.svelte";
import MenuItemTest from "./MenuItemTest.svelte";

describe("Menuitem", () => {
  const props = {
    href: "https://test.test/",
    testId: "menuitem-test",
  };

  it("should render a menuitem", () => {
    const { getByRole } = render(MenuItem, { props });
    expect(getByRole("menuitem")).not.toBeNull();
  });

  it("should render a link", () => {
    const { getByRole } = render(MenuItem, { props });

    const { href } = getByRole("menuitem") as HTMLLinkElement;
    expect(href).toEqual(props.href);
  });

  it("should not be selected per default", () => {
    const { getByRole } = render(MenuItem, { props });

    const { classList } = getByRole("menuitem") as HTMLLinkElement;
    expect(classList.contains("selected")).toBeFalsy();
  });

  it("should set a selected class if selected", () => {
    const { getByRole } = render(MenuItem, {
      props: {
        ...props,
        selected: true,
      },
    });

    const { classList } = getByRole("menuitem") as HTMLLinkElement;
    expect(classList.contains("selected")).toBeTruthy();
  });

  it("should render slotted content", () => {
    const { getByTestId } = render(MenuItemTest);

    expect(getByTestId("menuitem-test-default")).not.toBeNull();
  });

  it("should render slotted icon", () => {
    const { getByTestId } = render(MenuItemTest);

    expect(getByTestId("menuitem-test-icon")).not.toBeNull();
  });

  it("should render slotted statusIcon", () => {
    const { getByTestId } = render(MenuItemTest);

    expect(getByTestId("menuitem-test-status-icon")).not.toBeNull();
  });
});
