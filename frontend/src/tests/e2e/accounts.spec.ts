import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test accounts requirements", async ({ page, context }) => {
  await page.goto("/accounts");
  await expect(page).toHaveTitle("ICP Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("The user has a main account");

  const mainAccountName = "Main";
  const accountsPo = appPo.getAccountsPo();
  const nnsAccountsPo = accountsPo.getNnsAccountsPo();
  const tokensTablePo = nnsAccountsPo.getTokensTablePo();
  const mainAccountRow = await tokensTablePo.getRowByName(mainAccountName);
  await mainAccountRow.waitFor();

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

  // We wait until the table is loaded.
  await tokensTablePo.waitFor();
  // We wait until the subaccount row is loaded.
  const subaccountRow = await tokensTablePo.getRowByName(subAccountName);
  await subaccountRow.waitFor();

  expect(await accountNames()).toEqual([mainAccountName, subAccountName]);

  // Go to /tokens page because the Accounts page doesn't have the menu button.
  await appPo.goBack();
  // Get some ICP to be able to transfer
  await appPo.getIcpTokens(20);
  // Go back to /accounts page
  const icRow = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .getRowByName("Internet Computer");
  await icRow.click();

  await tokensTablePo.waitFor();

  step("AU004: The user MUST be able to transfer funds");
  expect(await mainAccountRow.getBalance()).toEqual("20.00 ICP");
  expect(await subaccountRow.getBalance()).toEqual("0 ICP");

  const subAccountAddress = await accountsPo.getAccountAddress(subAccountName);

  await mainAccountRow.click();
  await appPo.getWalletPo().getNnsWalletPo().transferToAccount({
    accountName: subAccountName,
    expectedAccountAddress: subAccountAddress,
    amount: 5,
  });
  await appPo.goBack();

  expect(await mainAccountRow.getBalance()).toEqual("15.00 ICP");
  expect(await subaccountRow.getBalance()).toEqual("5.00 ICP");

  step(
    "AU005: The user MUST be able to see the transactions of a specific account"
  );
  const mainAccountAddress =
    await accountsPo.getAccountAddress(mainAccountName);
  await subaccountRow.click();
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getUiTransactionsListPo();
  await transactionList.waitForLoaded();
  const transactions = await transactionList.getTransactionCardPos();
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];

  expect(await transaction.getIdentifier()).toBe(`From: ${mainAccountAddress}`);
  expect(await transaction.getAmount()).toBe("+5.00");
});
