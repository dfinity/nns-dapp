import type { FeatureKey } from "$lib/constants/environment.constants";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

let resolvePreviousStep = () => {
  /* this function will be replaced at each step */
};
let previousStep = undefined;

export const step = async (description: string) => {
  // We won't resolve the last step but Playwright doesn't mind.
  resolvePreviousStep();
  await previousStep;
  previousStep = test.step(description, () => {
    return new Promise<void>((resolve) => {
      resolvePreviousStep = resolve;
    });
  });
};

// This is useful during debugging to speed up the tests.
export const signInWithAnchor = async ({
  page,
  context,
  anchor,
}: {
  page: Page;
  context: BrowserContext;
  anchor: number;
}) => {
  step(`Sign in to existing anchor ${anchor}`);
  const iiPagePromise = context.waitForEvent("page");

  await page.locator("[data-tid=login-button]").click();

  const iiPage = await iiPagePromise;
  await expect(iiPage).toHaveTitle("Internet Identity");

  await iiPage.getByRole("button", { name: "Use Existing" }).click();
  await iiPage.getByPlaceholder("Enter anchor").fill(anchor.toString());
  await iiPage.getByRole("button", { name: "Continue" }).click();

  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);
  await step("Running the main test");
};

export const signInWithNewUser = async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}) => {
  step("Sign in");
  const iiPagePromise = context.waitForEvent("page");

  await page.locator("[data-tid=login-button]").click();

  const iiPage = await iiPagePromise;
  await expect(iiPage).toHaveTitle("Internet Identity");

  await iiPage
    .getByRole("button", { name: "Create Internet Identity" })
    .click();
  await iiPage.getByRole("button", { name: "Create Passkey" }).click();
  step("Sign in > creating identity");

  await iiPage.locator("input#captchaInput").fill("a");
  await iiPage.getByRole("button", { name: "Next" }).click();
  step("Sign in > verifying captcha");

  await iiPage.getByRole("button", { name: "Continue" }).click();

  step("Sign in > finalizing authentication");
  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);

  await step("Running the main test");
};

export const setFeatureFlag = ({
  page,
  featureFlag,
  value,
}: {
  page: Page;
  featureFlag: FeatureKey;
  value: boolean;
}) =>
  page.evaluate(
    ({ featureFlag, value }) =>
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (window as any).__featureFlags[featureFlag]["overrideWith"](value),
    { featureFlag, value }
  );

// Finds elements matching any of the selectors and replaces their
// `innerHTML` content with any of the `replacements`, if the current content
// matches the `pattern`.
// If more elements are found than replacements, the replacements will be
// reused in round-robin fashion.
export const replaceContent = async ({
  page,
  selectors,
  pattern,
  replacements,
}: {
  page: Page;
  selectors: string[];
  pattern: RegExp;
  replacements: string[];
}): Promise<void> => {
  await page.evaluate(
    ({ selectors, pattern, replacements }) =>
      document.querySelectorAll(selectors.join(", ")).forEach((el, i) => {
        if (pattern.test(el.innerHTML)) {
          el.innerHTML = replacements[i % replacements.length];
        }
      }),
    { selectors, pattern, replacements }
  );
};
