import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const waitForMilliseconds = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

test("Test accounts requirements", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("The user has a main account");

  const mainAccountName = "Main";
  let accountsPo = appPo.getAccountsPo();
  let nnsAccountsPo = accountsPo.getNnsAccountsPo();
  let tokensTablePo = nnsAccountsPo.getTokensTablePo();
  let mainAccountRow = await tokensTablePo.findRowByName(mainAccountName);
  expect(await mainAccountRow.isPresent()).toBe(true);

  step("AU002: The user MUST be able to create an additional account");
  const subAccountName = "My second account";
  await nnsAccountsPo.clickAddAccount();

  const addAccountModalPo = accountsPo.getAddAccountModalPo();
  expect(await addAccountModalPo.isPresent()).toBe(true);

  await addAccountModalPo.addAccount(subAccountName);
  await addAccountModalPo.waitForClosed();

  step("AU001: The user MUST be able to see a list of all their accounts");
  const accountNames = async () =>
    (await tokensTablePo.getRowsData()).map(({ projectName }) => projectName);
  expect(await accountNames()).toEqual([mainAccountName, subAccountName]);

  // The linked account should still be present after refresh
  await page.reload({ waitUntil: "load" });
  // We need to reset all the variables because the page has been reloaded.
  accountsPo = appPo.getAccountsPo();
  nnsAccountsPo = accountsPo.getNnsAccountsPo();
  tokensTablePo = nnsAccountsPo.getTokensTablePo();
  // We wait until the table is loaded.
  await tokensTablePo.waitFor();
  // We wait until the accounts are loaded.
  mainAccountRow = await tokensTablePo.findRowByName(mainAccountName);
  await mainAccountRow.waitFor();
  const subaccountRow = await tokensTablePo.findRowByName(subAccountName);
  await subaccountRow.waitFor();

  expect(await accountNames()).toEqual([mainAccountName, subAccountName]);

  // Go to /tokens page
  await appPo.goBack();
  // Get some ICP to be able to transfer
  await appPo.getIcpTokens(20);
  // Go back to /accounts page
  const icRow = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .findRowByName("Internet Computer");
  await icRow.click();

  // We need to reset all the variables because the page has been unmounted and mounted again.
  accountsPo = appPo.getAccountsPo();
  nnsAccountsPo = accountsPo.getNnsAccountsPo();
  tokensTablePo = nnsAccountsPo.getTokensTablePo();
  // We wait until the table is loaded.
  await tokensTablePo.waitFor();
  mainAccountRow = await tokensTablePo.findRowByName(mainAccountName);

  step("AU004: The user MUST be able to transfer funds");
  expect(await mainAccountRow.getBalance()).toEqual("20.00 ICP");
  expect(await subaccountRow.getBalance()).toEqual("0 ICP");

  // TODO: Use the send from the row instead of the footer
  await accountsPo.getNnsAccountsFooterPo().clickSend();

  const transactionModalPo = await accountsPo.getIcpTransactionModalPo();
  await transactionModalPo.waitFor();
  await transactionModalPo.transferToAccount({
    accountName: subAccountName,
    amount: 5,
  });
  await transactionModalPo.waitForClosed();

  expect(await mainAccountRow.getBalance()).toEqual("15.00 ICP");
  expect(await subaccountRow.getBalance()).toEqual("5.00 ICP");

  step(
    "AU005: The user MUST be able to see the transactions of a specific account"
  );
  await subaccountRow.click();
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getTransactionListPo();
  await transactionList.waitForLoaded();
  const transactions = await transactionList.getTransactionCardPos();
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];

  // expect(await transaction.getIdentifier()).toBe(`From: ${mainAccountAddress}`);
  expect(await transaction.getAmount()).toBe("+5.00");
});
