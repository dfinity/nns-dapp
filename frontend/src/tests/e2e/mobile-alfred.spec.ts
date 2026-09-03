import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test, type Locator, type Page } from "@playwright/test";

// The narrowest viewport the dapp supports. The toolbar crowding risk of the
// header search button is worst here.
const NARROW_VIEWPORT = { width: 320, height: 568 };

// A title that is much longer than any real page title. The header must still
// not put it under the toolbar buttons.
const LONG_TITLE = "Internet Computer Protocol Neuron Staking";

const boxOf = async (locator: Locator) => {
  const box = await locator.boundingBox();
  if (box === null) {
    throw new Error("The element has no bounding box.");
  }
  return box;
};

// Replaces the text of the header title. Only the DOM changes. The store and
// the component are untouched, so the layout is measured with a title that no
// route provides today.
const setHeaderTitle = async ({
  page,
  title,
}: {
  page: Page;
  title: string;
}) => {
  await page.evaluate((text) => {
    const heading = document.querySelector(
      '[data-tid="header-component"] h1'
    ) as HTMLElement | null;
    if (heading === null) {
      throw new Error("The header has no title.");
    }
    heading.textContent = text;
  }, title);
};

// The gap between the right edge of the title and the left edge of the toolbar
// end group. A negative gap means the buttons cover the end of the title.
const titleGap = async (page: Page) => {
  const title = await boxOf(page.locator('[data-tid="header-component"] h1'));
  const end = await boxOf(page.getByTestId("header-toolbar-component"));
  return end.x - (title.x + title.width);
};

// The size that the header gives an icon button.
const BUTTON_SIZE = 28;

// `Alfred.svelte` ignores a key that arrives less than this after the one
// before it. Two keys in a row need a pause between them.
const KEY_DEBOUNCE_MS = 100;

const toolbarButtonWidths = async (page: Page) =>
  await page
    .locator('[data-tid="header-toolbar-component"] button')
    .evaluateAll((elements) =>
      elements.map((element) =>
        Math.round(element.getBoundingClientRect().width)
      )
    );

// Adds a copy of the first toolbar button. The `AccountSyncIndicator` only
// renders while data loads, and this stands in for it. Only the DOM changes.
const addFakeToolbarButton = async (page: Page) => {
  await page.evaluate(() => {
    const group = document.querySelector(
      '[data-tid="header-toolbar-component"]'
    );
    if (group === null || group.firstElementChild === null) {
      throw new Error("The header has no toolbar buttons.");
    }
    group.prepend(group.firstElementChild.cloneNode(true));
  });
};

// Selects a theme the way the app does, then reloads. `app.html` reads the
// theme once, before the app starts.
const setTheme = async ({
  page,
  theme,
}: {
  page: Page;
  theme: "light" | "dark";
}) => {
  await page.evaluate((value) => {
    localStorage.setItem("nnsTheme", JSON.stringify(value));
  }, theme);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("theme", theme);
};

const alphaOf = (color: string) => {
  if (color === "transparent") return 0;
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (match === null) return 1;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  return parts.length < 4 ? 1 : parts[3];
};

test("Command palette on a narrow screen", async ({ page, browser }) => {
  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  const searchButton = page.getByTestId("open-alfred");
  const palette = page.getByTestId("alfred-component");
  const paletteMenu = palette.locator(".menu");
  const results = palette.locator(".results");

  await page.setViewportSize(NARROW_VIEWPORT);
  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  await step("The search button is in the header before sign in");
  await expect(searchButton).toBeVisible();
  await expect(searchButton).toHaveAttribute("aria-label", "Search");

  await step("One tap opens the palette");
  await expect(palette).toBeHidden();
  await searchButton.click();
  await expect(palette).toBeVisible();

  await step("The panel fits the narrow viewport");
  const menuBox = await boxOf(paletteMenu);
  // One gutter of --padding-2x (16px) on each side.
  expect(menuBox.x).toBeGreaterThanOrEqual(15);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(
    NARROW_VIEWPORT.width - 15
  );
  // 16px from the top of the viewport, not 15vh.
  expect(menuBox.y).toBeLessThanOrEqual(20);

  await step("The result list leaves room for the on-screen keyboard");
  const resultsMaxHeight = await results.evaluate(
    (element) => getComputedStyle(element).maxHeight
  );
  expect(parseFloat(resultsMaxHeight)).toBeLessThanOrEqual(
    NARROW_VIEWPORT.height * 0.45 + 1
  );

  await step("Every result row is a 44px touch target");
  const rowHeights = await palette
    .locator('[data-tid="alfred-result-button"]')
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height)
    );
  expect(rowHeights.length).toBeGreaterThan(0);
  for (const height of rowHeights) {
    expect(height).toBeGreaterThanOrEqual(44);
  }

  await step("The selected row has a visible background in both themes");
  // The app reads the theme once, at load. `dark` is the default of the app,
  // so both themes must be checked and dark must not be skipped.
  for (const theme of ["light", "dark"] as const) {
    await setTheme({ page, theme });
    await searchButton.click();
    await expect(palette).toBeVisible();

    // The rows sit on the result list, not on the panel, so the list is what
    // the row colour has to differ from.
    const listBackground = await results.evaluate(
      (element) => getComputedStyle(element).backgroundColor
    );
    const selectedBackground = await palette
      .locator("li.selected .item-button")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    const iconBackground = await palette
      .locator("li.selected .item-icon")
      .evaluate((element) => getComputedStyle(element).backgroundColor);

    expect(alphaOf(selectedBackground)).toBeGreaterThan(0);
    expect(alphaOf(iconBackground)).toBeGreaterThan(0);
    // A row that has the colour of the list it sits on is invisible. The theme
    // name is in the message so a failure says which theme is wrong.
    expect(`${theme} selected row: ${selectedBackground}`).not.toBe(
      `${theme} selected row: ${listBackground}`
    );
    expect(`${theme} icon tile: ${iconBackground}`).not.toBe(
      `${theme} icon tile: ${listBackground}`
    );

    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();
  }

  await step("A tap outside closes the palette");
  await searchButton.click();
  await expect(palette).toBeVisible();
  await page.mouse.click(NARROW_VIEWPORT.width - 5, NARROW_VIEWPORT.height - 5);
  await expect(palette).toBeHidden();

  await step("A util form opens and Escape returns to the search");
  // The panel resets itself when it opens. The reset must not run again when
  // the search input leaves the DOM for a util form.
  await searchButton.click();
  await palette.getByTestId("alfred-input").fill("encode");
  await palette.locator('[data-tid="alfred-result-button"]').first().click();
  await expect(palette.getByTestId("alfred-input")).toBeHidden();
  await expect(palette).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette.getByTestId("alfred-input")).toBeVisible();
  await expect(palette.getByTestId("alfred-input")).toHaveValue("");
  await expect(palette).toBeVisible();
  // The panel drops a key that arrives within 50ms of the one before it.
  await page.waitForTimeout(KEY_DEBOUNCE_MS);
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();

  await step("A result navigates and closes the palette");
  await searchButton.click();
  await palette.getByTestId("alfred-input").fill("settings");
  await palette.locator('[data-tid="alfred-result-button"]').first().click();
  await expect(palette).toBeHidden();
  await expect(page).toHaveURL(/\/settings/);

  await step("Sign in");
  await signInWithNewUser({ page, context: browser.contexts()[0] });
  await page.setViewportSize(NARROW_VIEWPORT);

  await step("The search button is still in the header after sign in");
  await page.goto("/staking");
  await expect(searchButton).toBeVisible();

  await step("The buttons do not cover the page title");
  expect(await titleGap(page)).toBeGreaterThanOrEqual(0);

  await step("The buttons do not cover a very long page title");
  await setHeaderTitle({ page, title: LONG_TITLE });
  expect(await titleGap(page)).toBeGreaterThanOrEqual(0);

  await step("The header never widens the page");
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  );
  expect(scrollWidth).toBeLessThanOrEqual(NARROW_VIEWPORT.width);

  await step("No header button is squashed, not even with the sync indicator");
  // The toolbar buttons can shrink, so a column that is too narrow makes them
  // slivers instead of pushing them out. The sync indicator only appears while
  // data loads, so a copy of a button stands in for the 3 button case.
  expect(await toolbarButtonWidths(page)).toEqual([BUTTON_SIZE, BUTTON_SIZE]);
  await addFakeToolbarButton(page);
  expect(await toolbarButtonWidths(page)).toEqual([
    BUTTON_SIZE,
    BUTTON_SIZE,
    BUTTON_SIZE,
  ]);
  await page.reload();

  await step("The palette opens from the button when signed in");
  await searchButton.click();
  await expect(palette).toBeVisible();
  const signedInTitles = await palette
    .locator('[data-tid="alfred-result-title"]')
    .allInnerTexts();
  expect(signedInTitles).toContain("Copy principal ID");
  expect(signedInTitles).toContain("Log Out");

  await step("Escape closes the palette");
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();

  await step("The keyboard shortcut still works");
  await page.keyboard.press("Control+k");
  await expect(palette).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();

  await step("The header is unchanged on a wide screen");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(searchButton).toBeVisible();
  const wideColumns = await page
    .locator('[data-tid="header-component"] .toolbar')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  const wideWidths = wideColumns.split(" ").map((column) => parseFloat(column));
  // 15% of the header width on each side, as the gix Toolbar defines it.
  expect(wideWidths[0]).toBeCloseTo(wideWidths[2], 0);
  expect(await titleGap(page)).toBeGreaterThan(0);

  await appPo.waitForNotBusy();
});
