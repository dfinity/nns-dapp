import { expect, type BrowserContext, type Page } from "@playwright/test";

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
  const iiPagePromise = context.waitForEvent("page");

  await page.locator("[data-tid=login-button]").click();

  const iiPage = await iiPagePromise;
  await expect(iiPage).toHaveTitle("Internet Identity");

  await iiPage.getByRole("button", { name: "Use Existing" }).click();
  await iiPage.getByPlaceholder("Enter anchor").fill(anchor.toString());
  await iiPage.getByRole("button", { name: "Continue" }).click();

  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);
};

export const signInWithNewUser = async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}) => {
  const iiPagePromise = context.waitForEvent("page");

  await new Promise((resolve) => setTimeout(resolve, 5000));
  expect(page).toHaveScreenshot();
  await page.locator("[data-tid=login-button]").click();

  const iiPage = await iiPagePromise;
  await expect(iiPage).toHaveTitle("Internet Identity");

  await iiPage.getByRole("button", { name: "Create an Anchor" }).click();
  await iiPage.getByPlaceholder("Example: my phone").fill("my phone");
  await iiPage.getByRole("button", { name: "Next" }).click();
  await iiPage.locator("input#captchaInput").fill("a");
  await iiPage.getByRole("button", { name: "Next" }).click();
  await iiPage.getByRole("button", { name: "Continue" }).click();
  await iiPage.getByText("Choose a Recovery Method").waitFor();
  await iiPage.getByRole("button", { name: /Skip/ }).click();
  await iiPage.getByRole("button", { name: "Add another device" }).waitFor();
  await iiPage.getByRole("button", { name: /Skip/ }).click();

  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);
};
