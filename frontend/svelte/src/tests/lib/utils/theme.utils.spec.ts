/**
 * @jest-environment jsdom
 */

import { Theme } from "../../../lib/types/theme";
import { applyTheme } from "../../../lib/utils/theme.utils";

describe("theme-utils", () => {
  it("should apply theme to root html element", () => {
    applyTheme(Theme.DARK);

    const { documentElement } = document;

    expect(documentElement).toHaveAttribute("theme");
    expect(documentElement.getAttribute("theme")).toContain(`${Theme.DARK}`);
  });

  it("should update meta theme color in head element", () => {
    // Theme color tag should be defined statically by app owner first
    document.head.insertAdjacentHTML(
        'beforeend', '<meta name="theme-color" />'
    );

    applyTheme(Theme.DARK);

    const { head } = document;
    const meta = head.querySelector("meta") as HTMLElement;

    expect(meta).not.toBeNull();
    expect(meta).toHaveAttribute("content");
  });
});
