import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const TEST_TOKEN_NAME = "ckRED";
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

// The route below holds every nns-dapp update call for this long.
const UPDATE_CALL_DELAY_MS = 15_000;
// The remove waits for one delayed update call. Give it more time than the
// delay above.
const REMOVE_TIMEOUT_MS = 60_000;

const expectNoImportedTokenError = (messages: string[]) => {
  for (const errorMessage of IMPORTED_TOKEN_ERROR_MESSAGES) {
    expect(messages).not.toContain(errorMessage);
  }
};

// A remove replaces the whole imported-token list in the backend. The service
// builds that list from certified data. When the store holds a query response,
// the service reloads the imported tokens with an update call first.
//
// This test slows the nns-dapp update calls, so the store holds only a query
// response when the user clicks Remove. The remove must still succeed.
test("Remove an imported token while the store holds a query response", async ({
  page,
  context,
}) => {
  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const indexCanisterId = await dfxCanisterId("ckred_index");
  const nnsDappCanisterId = await dfxCanisterId("nns-dapp");

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();
  const importedTokensTablePo = tokensPagePo.getImportedTokensTable();
  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  const toastsPo = appPo.getToastsPo();

  step("The new user has no imported token");

  await tokensPagePo.getSettingsButtonPo().waitFor();
  expect(await importedTokensTablePo.isPresent()).toBe(false);

  step("Open the import token modal");

  await tokensPagePo.getSettingsButtonPo().click();

  const importButtonPo = tokensPagePo.getImportTokenButtonPo();
  await importButtonPo.waitFor();
  await importButtonPo.click();
  await importTokenModalPo.waitFor();

  step("Enter the ledger and index canister ids");

  await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(indexCanisterId);
  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();

  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);

  step("Import the token");

  // The import waits for the certified imported tokens itself. The app opens
  // the wallet page only after that call returns.
  await reviewPo.getConfirmButtonPo().click();
  await walletPo.waitFor();

  step("Slow the nns-dapp update calls");

  await page.route(
    `**/api/v*/canister/${nnsDappCanisterId}/call`,
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, UPDATE_CALL_DELAY_MS));
      await route.continue();
    }
  );

  step("Reload the page, so the store holds only a query response");

  await page.reload();
  await disableCssAnimations(page);
  await walletPo.waitFor();

  step("Remove the imported token");

  await walletPo.getMoreButton().click();
  await walletPo.getWalletMorePopoverPo().waitFor();
  await walletPo.getWalletMorePopoverPo().getRemoveButtonPo().click();

  await walletPo.getImportTokenRemoveConfirmationPo().waitFor();
  await walletPo.getImportTokenRemoveConfirmationPo().clickYes();

  step("The user sees the success message and no imported-token error");

  await page
    .getByText(REMOVE_SUCCESS_MESSAGE)
    .waitFor({ timeout: REMOVE_TIMEOUT_MS });

  const messages = await toastsPo.getMessages();
  expect(messages).toContain(REMOVE_SUCCESS_MESSAGE);
  expectNoImportedTokenError(messages);

  step("The removed token is gone from the tokens page");

  await page.unrouteAll({ behavior: "ignoreErrors" });
  await tokensPagePo.getSettingsButtonPo().waitFor();
  await importedTokensTablePo.waitForAbsent();
});
