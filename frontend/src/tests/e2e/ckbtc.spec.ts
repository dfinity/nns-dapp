import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test accounts requirements", async ({ page, context }) => {
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Check BTC balance");
  const tokensTablePo = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable();
  await tokensTablePo.waitFor();
  const ckBTCRow = await tokensTablePo.getRowByName("ckBTC");
  await ckBTCRow.waitForBalance();
  expect(await ckBTCRow.getBalance()).toBe("0 ckBTC");

  step("Get BTC");
  await appPo.getBtc(20);

  step("Open ckBTC wallet");
  await ckBTCRow.click();

  step("Refresh Balance");
  await appPo.getWalletPo().getCkBTCWalletPo().clickRefreshBalance();
  await appPo.waitForNotBusy();

  step("Check transactions");
  const transactionList = await appPo
    .getWalletPo()
    .getCkBTCWalletPo()
    .getUiTransactionsListPo();
  await transactionList.waitForLoaded();

  const transactions = await transactionList.getTransactionCardPos();
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];

  expect(await transaction.getIdentifier()).toBe("From: BTC Network");
  // 20 minus fees.
  expect(await transaction.getAmount()).toBe("+19.99999");
});
