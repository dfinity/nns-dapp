import { expect, test, type BrowserContext, type Page } from "@playwright/test";

let resolvePreviousStep = () => {};
let previousStep = undefined;

export const step = async (description: string) => {
  resolvePreviousStep();
  await previousStep;
  previousStep = test.step(description, () => {
    return new Promise((resolve) => {
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

  await iiPage.getByRole("button", { name: "Create an Anchor" }).click();
  await iiPage.getByPlaceholder("Example: my phone").fill("my phone");
  await iiPage.getByRole("button", { name: "Next" }).click();
  step("Sign in > creating identity");

  await iiPage.locator("input#captchaInput").fill("a");
  await iiPage.getByRole("button", { name: "Next" }).click();
  step("Sign in > verifying captcha");

  await iiPage.getByRole("button", { name: "Continue" }).click();
  await iiPage.getByText("Choose a Recovery Method").waitFor();
  await iiPage.getByRole("button", { name: /Skip/ }).click();
  await iiPage.getByRole("button", { name: "Add another device" }).waitFor();
  await iiPage.getByRole("button", { name: /Skip/ }).click();

  step("Sign in > finalizing authentication");
  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);

  await step("Running the main test");
};
