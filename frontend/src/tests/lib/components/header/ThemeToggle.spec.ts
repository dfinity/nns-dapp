/**
 * @jest-environment jsdom
 */

import ThemeToggle from "$lib/components/header/ThemeToggle.svelte";
import { themeStore } from "$lib/stores/theme.store";
import { Theme } from "$lib/types/theme";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";
import en from "../../../mocks/i18n.mock";

describe("ThemeToggle", () => {
  it("should render a toggle", () => {
    const { container } = render(ThemeToggle);

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.getAttribute("type")).toEqual("checkbox");
  });

  it("should render an accessible toggle", () => {
    const { container } = render(ThemeToggle);

    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toEqual(en.theme.switch_theme);
  });

  it("should switch theme", () => {
    const { container } = render(ThemeToggle);

    const input = container.querySelector("input") as HTMLInputElement;

    fireEvent.click(input);
    expect(get(themeStore)).toEqual(Theme.LIGHT);

    fireEvent.click(input);
    expect(get(themeStore)).toEqual(Theme.DARK);
  });
});
