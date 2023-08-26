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

  step("The user has a main account");

  const mainAccountName = "Main";
  const nnsAccountsPo = appPo.getAccountsPo().getNnsAccountsPo();
  expect(
    await nnsAccountsPo.getMainAccountCardPo().getAccountName(),
    mainAccountName
  );

  step("AU002: The user MUST be able to create an additional account");
  const subAccountName = "My second account";
  await nnsAccountsPo.addAccount(subAccountName);

  step("AU001: The user MUST be able to see a list of all their accounts");
  const accountNames = async () => await nnsAccountsPo.getAccountNames();
  expect(await accountNames()).toEqual([mainAccountName, subAccountName]);

  // The linked account should still be present after refresh
  page.reload();
  expect(await accountNames()).toEqual([mainAccountName, subAccountName]);

  // Get some ICP to be able to transfer
  await appPo.getIcpTokens(20);

  step("AU004: The user MUST be able to transfer funds");
  expect(await nnsAccountsPo.getAccountBalance(mainAccountName)).toEqual(
    "20.00"
  );
  expect(await nnsAccountsPo.getAccountBalance(subAccountName)).toEqual("0");

  const subAccountAddress = await nnsAccountsPo.getAccountAddress(
    subAccountName
  );
  await nnsAccountsPo.getMainAccountCardPo().click();
  await appPo.getWalletPo().getNnsWalletPo().transferToAccount({
    accountName: subAccountName,
    expectedAccountAddress: subAccountAddress,
    amount: 5,
  });

  await appPo.goBack();
  await nnsAccountsPo.getMainAccountCardPo().getAmountDisplayPo().waitFor();
  expect(await nnsAccountsPo.getAccountBalance(mainAccountName)).toEqual(
    "15.00"
  );
  expect(await nnsAccountsPo.getAccountBalance(subAccountName)).toEqual("5.00");

  step(
    "AU005: The user MUST be able to see the transactions of a specific account"
  );
  const mainAccountAddress = await nnsAccountsPo.getAccountAddress(
    mainAccountName
  );
  await nnsAccountsPo.openAccount(subAccountName);
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getTransactionListPo();
  await transactionList.waitForLoaded();
  const transactions = await transactionList.getTransactionCardPos();
  expect(transactions).toHaveLength(1);
  const transaction = transactions[0];

  expect(await transaction.getIdentifier()).toBe(
    `Source: ${mainAccountAddress}`
  );
  expect(await transaction.getAmount()).toBe("+5.00");
});
