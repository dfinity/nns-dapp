/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import Menu from "../../../../lib/components/common/Menu.svelte";

describe("Menu", () => {
  it("menu should be closed per default", () => {
    const { getByRole } = render(Menu);
    expect(() => getByRole("menu")).toThrow();
  });

  it("should not render a get icps feature", async () => {
    const renderResult = render(Menu, { props: { open: true } });

    const { getByTestId } = renderResult;

    expect(() => getByTestId("get-icp-button")).toThrow();
  });

  it("should render navigation", async () => {
    const renderResult = render(Menu, { props: { open: true } });

    const { getAllByRole } = renderResult;

    expect(getAllByRole("menuitem").length > 0).toBeTruthy();
  });
});
