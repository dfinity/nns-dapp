import { expect, type BrowserContext, type Page } from "@playwright/test";

export const signInWithNewUser = async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}) => {
  const iiPagePromise = context.waitForEvent("page");

  await page.locator("[data-tid=login-button]").click();

  const iiPage = await iiPagePromise;
  await expect(iiPage).toHaveTitle("Internet Identity");
  await iiPage.getByRole("button", { name: "Create an Anchor" }).click();
  await iiPage.getByPlaceholder("Example: my phone").fill("my phone");
  await iiPage.getByRole("button", { name: "Next" }).click();
  await iiPage.locator("input#captchaInput").fill("a");
  await iiPage.getByRole("button", { name: "Next" }).click();
  await iiPage.getByRole("button", { name: "Continue" }).click();
  await iiPage.getByRole("button", { name: /Skip/ }).click();
  await iiPage.getByRole("button", { name: /Skip/ }).click();
  await iiPage.waitForEvent("close");
  await expect(iiPage.isClosed()).toBe(true);
};
