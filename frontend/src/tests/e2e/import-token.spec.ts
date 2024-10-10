import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const TEST_TOKEN_NAME = "ckRED";
const TEST_LEDGER_CANISTER_ID = "myg3h-jmaaa-aaaaa-qabiq-cai";
const TEST_INDEX_CANISTER_ID = "mrfq3-7eaaa-aaaaa-qabja-cai";

test("Test imported tokens", async ({ page, context }) => {
  await page.goto("/tokens");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
  const importButtonPo = tokensPagePo.getImportTokenButtonPo();
  const tokenNames = () => tokensPagePo.getTokenNames();

  step("Wait for the import token button is present");

  await importButtonPo.waitFor();
  const initialTokenNames = await tokenNames();
  expect(initialTokenNames).not.toContain(TEST_TOKEN_NAME);

  step("Enter the ledger and index canister ids");

  await importButtonPo.click();
  const importTokenModalPo = appPo
    .getTokensPo()
    .getTokensPagePo()
    .getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();

  await importTokenModalPo.waitFor();

  await formPo.getLedgerCanisterInputPo().typeText(TEST_LEDGER_CANISTER_ID);
  await formPo.getIndexCanisterInputPo().typeText(TEST_INDEX_CANISTER_ID);

  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();

  step("Review imported token");

  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);
  expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toBe(
    TEST_LEDGER_CANISTER_ID
  );
  expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toBe(
    TEST_INDEX_CANISTER_ID
  );

  step("Import the token");

  await reviewPo.getConfirmButtonPo().click();

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();
  expect(
    await appPo
      .getWalletPo()
      .getIcrcWalletPo()
      .getWalletPageHeaderPo()
      .getUniverseSummaryPo()
      .getTitle()
  ).toEqual(TEST_TOKEN_NAME);

  step("The imported token should be present in the tokens table");

  await appPo.goBack();
  await appPo.getTokensPo().getTokensPagePo().getTokensTable().waitFor();

  expect(await tokenNames()).toContain(TEST_TOKEN_NAME);

  step("The user can navigate to the imported token page");

  const importedTokenRowPo = tokensPagePo
    .getTokensTable()
    .getRowByName(TEST_TOKEN_NAME);
  (await importedTokenRowPo).click();
  await walletPo.waitFor();

  step("The user can remove the imported token");

  await walletPo.getMoreButton().click();
  await walletPo.getWalletMorePopoverPo().waitFor();
  await walletPo.getWalletMorePopoverPo().getRemoveButtonPo().click();

  await walletPo.getImportTokenRemoveConfirmationPo().waitFor();
  await walletPo.getImportTokenRemoveConfirmationPo().clickYes();

  step("The imported token should not be present in the tokens table anymore");

  await tokensPagePo.waitFor();
  expect(await tokenNames()).toEqual(initialTokenNames);

  step("Import the token again");

  await importButtonPo.waitFor();
  expect(initialTokenNames).not.toContain(TEST_TOKEN_NAME);

  step("Enter the ledger canister id only");

  await importButtonPo.click();
  await importTokenModalPo.waitFor();
  await formPo.getLedgerCanisterInputPo().typeText(TEST_LEDGER_CANISTER_ID);

  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();

  step("Review imported token");

  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);
  expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toBe(
    TEST_LEDGER_CANISTER_ID
  );
  expect(
    await reviewPo.getIndexCanisterIdPo().getCanisterIdFallback().isPresent()
  ).toBe(true);

  step("Import the token");

  await reviewPo.getConfirmButtonPo().click();
  await walletPo.waitFor();
  expect(
    await appPo
      .getWalletPo()
      .getIcrcWalletPo()
      .getWalletPageHeaderPo()
      .getUniverseSummaryPo()
      .getTitle()
  ).toEqual(TEST_TOKEN_NAME);

  step("The imported token should be present in the tokens table");

  await appPo.goBack();
  await appPo.getTokensPo().getTokensPagePo().getTokensTable().waitFor();

  expect(await tokenNames()).toContain(TEST_TOKEN_NAME);
});
