/**
 * @jest-environment jsdom
 */

import { get } from "svelte/store";
import { theme } from "../../../lib/stores/theme.store";
import * as themeUtils from "../../../lib/utils/theme.utils";

enum TestTheme {
  DARK = "dark",
  LIGHT = "light",
}

describe("theme-store", () => {
  it("should select and apply theme", () => {
    const applyTheme = jest.spyOn(themeUtils, "applyTheme");

    // @ts-ignore we have just one theme at the moment therefore we use pseudo themes for test purpose
    theme.select(TestTheme.LIGHT);

    const themeValue = get(theme);
    expect(themeValue).toEqual(`${TestTheme.LIGHT}`);
    expect(applyTheme).toHaveBeenCalled();
  });
});
