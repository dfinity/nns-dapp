import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test accounts requirements", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Navigate to ckBTC universe");
  await appPo.openUniverses();
  await appPo.getSelectUniverseListPo().goToCkbtcUniverse();

  step("Check BTC balance");
  await appPo
    .getAccountsPo()
    .getCkBTCAccountsPo()
    .waitForWithdrawalAccountDone();

  step("Get BTC");
  await appPo.getBtc(20);

  step("Open ckBTC wallet");
  await appPo
    .getAccountsPo()
    .getCkBTCAccountsPo()
    .getMainAccountCardPo()
    .click();

  step("Refresh Balance");
  await appPo.getWalletPo().getCkBTCWalletPo().clickRefreshBalance();
  await appPo.waitForNotBusy();

  step("Check transactions");
  const transactionList = await appPo
    .getWalletPo()
    .getCkBTCWalletPo()
    .getIcrcTransactionsListPo();
  await transactionList.waitForLoaded();

  const transactions = await transactionList.getTransactionCardPos();
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];

  expect(await transaction.getIdentifier()).toBe("From: BTC Network");
  // 20 minus fees.
  expect(await transaction.getAmount()).toBe("+19.99986667");
});
