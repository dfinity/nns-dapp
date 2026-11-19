import ThemeToggleButton from "$lib/gix/components/ThemeToggleButton.svelte";
import IconDarkMode from "$lib/gix/icons/IconDarkMode.svelte";
import IconLightMode from "$lib/gix/icons/IconLightMode.svelte";
import { themeStore } from "$lib/gix/stores/theme.store";
import { Theme } from "$lib/gix/types/theme";
import en from "$tests/lib/gix/mocks/i18n.mock";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ThemeToggleButton", () => {
  it("should render a toggle button", () => {
    const { container } = render(ThemeToggleButton);

    const input = container.querySelector("button") as HTMLButtonElement;

    expect(input).not.toBeNull();
  });

  it("should render an accessible toggle button", () => {
    const { container } = render(ThemeToggleButton);

    const input = container.querySelector("button") as HTMLButtonElement;

    expect(input.getAttribute("aria-label")).toEqual(en.theme.switch_theme);
  });

  it("should switch theme", () => {
    const { container } = render(ThemeToggleButton);

    const input = container.querySelector("button") as HTMLButtonElement;

    fireEvent.click(input);

    expect(get(themeStore)).toEqual(Theme.LIGHT);

    fireEvent.click(input);

    expect(get(themeStore)).toEqual(Theme.DARK);
  });

  it("should render IconLightMode when theme is dark", () => {
    themeStore.select(Theme.DARK);
    const { container } = render(ThemeToggleButton);

    const lightModeIcon = container.querySelector("svg");

    expect(lightModeIcon).toBeInstanceOf(SVGSVGElement);
    expect(container.innerHTML).toContain(
      render(IconLightMode).container.innerHTML
    );
  });

  it("should render IconDarkMode when theme is light", () => {
    themeStore.select(Theme.LIGHT);
    const { container } = render(ThemeToggleButton);

    const darkModeIcon = container.querySelector("svg");

    expect(darkModeIcon).toBeInstanceOf(SVGSVGElement);
    expect(container.innerHTML).toContain(
      render(IconDarkMode).container.innerHTML
    );
  });
});
