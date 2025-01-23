import type { FeatureKey } from "$lib/constants/environment.constants";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { exec } from "child_process";

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

export const setFeatureFlag = async ({
  page,
  featureFlag,
  value,
}: {
  page: Page;
  featureFlag: FeatureKey;
  value: boolean;
}) => {
  // Wait for feature flags to be available
  await page.waitForFunction(
    () => (window as any).__featureFlags !== undefined
  );

  return page.evaluate(
    ({ featureFlag, value }) =>
      (window as any).__featureFlags[featureFlag]["overrideWith"](value),
    { featureFlag, value }
  );
};

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
  const replacementCount = await page.evaluate(
    ({ selectors, pattern, replacements }) => {
      let replacementCount = 0;
      document.querySelectorAll(selectors.join(", ")).forEach((el, i) => {
        if (pattern.test(el.innerHTML)) {
          el.innerHTML = replacements[i % replacements.length];
          replacementCount++;
        }
      });
      return replacementCount;
    },
    { selectors, pattern, replacements }
  );
  expect(replacementCount).toBeGreaterThan(0);
};

export const dfxCanisterId = async (canisterName: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(`dfx canister id ${canisterName}`, (error, stdout, _stderr) => {
      if (error) {
        reject(error);
      }
      resolve(stdout.trim());
    });
  });
};
