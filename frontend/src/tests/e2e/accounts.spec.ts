import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test accounts requirements", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  // The user has a main account
  const mainAccountName = "Main";
  const nnsAccountsPo = appPo.getAccountsPo().getNnsAccountsPo();
  expect(
    await nnsAccountsPo.getMainAccountCardPo().getAccountName(),
    mainAccountName
  );

  // AU002: The user MUST be able to create an additional account
  const subAccountName = "My second account";
  await nnsAccountsPo.addAccount(subAccountName);

  // AU001: The user MUST be able to see a list of all their accounts
  const accountNames = await nnsAccountsPo.getAccountNames();
  expect(accountNames).toEqual([mainAccountName, subAccountName]);

  // TODO:

  // AU004: The user MUST be able to transfer funds

  // AU005: The user MUST be able to see the transactions of a specific account
});
