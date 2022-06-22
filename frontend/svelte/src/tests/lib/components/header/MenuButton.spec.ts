/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import MenuButtonTest from "./MenuButtonTest.svelte";

describe("MenuButton", () => {
  const openMenu = async ({ getByTestId }) => {
    const button = getByTestId("menu") as HTMLButtonElement;
    await fireEvent.click(button);
  };

  it("should trigger open the menu", async () => {
    const spyOpen = jest.fn();

    const renderResult = render(MenuButtonTest, { props: { spy: spyOpen } });

    await openMenu(renderResult);

    expect(spyOpen).toBeCalled();
  });
});
