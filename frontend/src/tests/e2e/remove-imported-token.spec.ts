import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { nonNullish } from "@dfinity/utils";
import { expect, test, type Page } from "@playwright/test";

const FIRST_TOKEN_NAME = "ckRED";
const REMOVE_SUCCESS_MESSAGE = "The token has been successfully removed!";
const NOT_CERTIFIED_MESSAGE =
  "We could not verify your imported tokens, so nothing was saved. Please reload the page and try again.";
const TOKEN_NOT_FOUND_MESSAGE =
  "This token is not in your verified token list, so nothing was saved. Please reload the page and try again.";
const REMOVE_ERROR_MESSAGE =
  "There was an unexpected issue while removing the imported token.";

const IMPORTED_TOKEN_ERROR_MESSAGES = [
  NOT_CERTIFIED_MESSAGE,
  TOKEN_NOT_FOUND_MESSAGE,
  REMOVE_ERROR_MESSAGE,
];

// The app loads the imported tokens with a query call and an update call.
// The update call takes a few seconds on the local replica.
const CERTIFIED_LOAD_TIMEOUT = 8000;

const expectNoImportedTokenError = (messages: string[]) => {
  for (const errorMessage of IMPORTED_TOKEN_ERROR_MESSAGES) {
    expect(messages).not.toContain(errorMessage);
  }
};

const removeImportedToken = async (appPo: AppPo) => {
  const walletPo = appPo.getWalletPo().getIcrcWalletPo();

  await walletPo.getMoreButton().click();
  await walletPo.getWalletMorePopoverPo().waitFor();
  await walletPo.getWalletMorePopoverPo().getRemoveButtonPo().click();

  await walletPo.getImportTokenRemoveConfirmationPo().waitFor();
  await walletPo.getImportTokenRemoveConfirmationPo().clickYes();
};

const importToken = async ({
  page,
  appPo,
  ledgerCanisterId,
  indexCanisterId,
}: {
  page: Page;
  appPo: AppPo;
  ledgerCanisterId: string;
  indexCanisterId?: string;
}): Promise<string> => {
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();

  await tokensPagePo.getSettingsButtonPo().click();

  const importButtonPo = tokensPagePo.getImportTokenButtonPo();
  await importButtonPo.waitFor();
  await importButtonPo.click();
  await importTokenModalPo.waitFor();

  await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId);
  if (nonNullish(indexCanisterId)) {
    await formPo.getIndexCanisterInputPo().typeText(indexCanisterId);
  }

  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();

  const tokenName = await reviewPo.getTokenName();

  await reviewPo.getConfirmButtonPo().click();
  await appPo.getWalletPo().getIcrcWalletPo().waitFor();

  // An import reloads the imported tokens. Wait for the certified response,
  // because a remove needs the certified imported tokens.
  await page.waitForTimeout(CERTIFIED_LOAD_TIMEOUT);

  return tokenName;
};

// A remove replaces the whole imported-token list in the backend.
// This test checks that a remove deletes one token and keeps the other one.
test("Remove one imported token and keep the other", async ({
  page,
  context,
}) => {
  const firstLedgerCanisterId = await dfxCanisterId("ckred_ledger");
  const firstIndexCanisterId = await dfxCanisterId("ckred_index");
  const secondLedgerCanisterId = await dfxCanisterId("ckusdc_ledger");

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  const importedTokensTablePo = tokensPagePo.getImportedTokensTable();
  const toastsPo = appPo.getToastsPo();

  step("The new user has no imported token");

  await tokensPagePo.getSettingsButtonPo().waitFor();
  expect(await importedTokensTablePo.isPresent()).toBe(false);

  step("Import the first token");

  const firstTokenName = await importToken({
    page,
    appPo,
    ledgerCanisterId: firstLedgerCanisterId,
    indexCanisterId: firstIndexCanisterId,
  });
  expect(firstTokenName).toBe(FIRST_TOKEN_NAME);

  await appPo.goBack();
  await importedTokensTablePo.waitFor();

  step("Import the second token");

  const secondTokenName = await importToken({
    page,
    appPo,
    ledgerCanisterId: secondLedgerCanisterId,
  });
  expect(secondTokenName).not.toBe(FIRST_TOKEN_NAME);

  await appPo.goBack();
  await importedTokensTablePo.waitFor();

  step("Both imported tokens are in the table");

  expect((await importedTokensTablePo.getTokenNames()).sort()).toEqual(
    [firstTokenName, secondTokenName].sort()
  );

  step("Open the first imported token");

  const firstTokenRowPo =
    await importedTokensTablePo.getRowByName(firstTokenName);
  await firstTokenRowPo.click();
  await walletPo.waitFor();

  step("Remove the first imported token");

  await removeImportedToken(appPo);

  step("The user sees the success message and no imported-token error");

  await page.getByText(REMOVE_SUCCESS_MESSAGE).waitFor();

  const messages = await toastsPo.getMessages();
  expect(messages).toContain(REMOVE_SUCCESS_MESSAGE);
  expectNoImportedTokenError(messages);

  step("Only the removed token is gone from the table");

  await importedTokensTablePo.waitFor();
  expect(await importedTokensTablePo.getTokenNames()).toEqual([
    secondTokenName,
  ]);

  step("The backend kept the second token after a page reload");

  await page.reload();
  await disableCssAnimations(page);
  await importedTokensTablePo.waitFor();

  expect(await importedTokensTablePo.getTokenNames()).toEqual([
    secondTokenName,
  ]);
});

// The service builds the replacement list from certified data. When the store
// holds a query response, the service reloads the imported tokens first. That
// reload must wait for the certified response. This test slows the nns-dapp
// update calls, so the store holds a query response when the user clicks
// Remove.
test("Remove an imported token while the store holds a query response", async ({
  page,
  context,
}) => {
  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const nnsDappCanisterId = await dfxCanisterId("nns-dapp");

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  const toastsPo = appPo.getToastsPo();

  step("Import a token");

  await importToken({ page, appPo, ledgerCanisterId });

  step("Slow the nns-dapp update calls");

  await page.route(
    `**/api/v*/canister/${nnsDappCanisterId}/call`,
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 15000));
      await route.continue();
    }
  );

  step("Reload the page, so the store holds only a query response");

  await page.reload();
  await disableCssAnimations(page);
  await walletPo.waitFor();

  step("Remove the imported token");

  await removeImportedToken(appPo);

  step("The user sees the success message and no imported-token error");

  // The certified response takes 15 seconds here, so allow more time.
  await page.getByText(REMOVE_SUCCESS_MESSAGE).waitFor({ timeout: 60 * 1000 });

  const messages = await toastsPo.getMessages();
  expect(messages).toContain(REMOVE_SUCCESS_MESSAGE);
  expectNoImportedTokenError(messages);
});
