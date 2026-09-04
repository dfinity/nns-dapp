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

// Playwright cannot import $lib/i18n/en.json, so the expected strings are
// copied from that file.
// error.fetch_transactions:
const APP_TRANSACTIONS_ERROR =
  "Sorry, there was an error loading the transactions for this account.";
// accounts.transaction_success:
const ATTACKER_TARGET_TEXT = "Transaction completed.";
// The label key that the attacker wants the toast to resolve.
const ATTACKER_MESSAGE = "accounts.transaction_success";

// The index canister of an imported token belongs to the user who typed its id,
// so the app must treat the text it returns as free text. Before the fix,
// toToastError() resolved that text as an i18n label key, so the canister chose
// which application string the error toast showed.
//
// Playwright cannot make the index canister return a chosen Err message,
// because that needs a certified reply from a canister we control. It can make
// the index call fail with the canister's own text in the response body. The
// test therefore checks the branch the fix relies on: an error that comes from
// the index canister shows the app's own transactions error, and no other
// application string.
test("An index canister cannot choose the text of the error toast", async ({
  page,
  context,
}) => {
  const testLedgerCanisterId = await dfxCanisterId("ckred_ledger");
  const testIndexCanisterId = await dfxCanisterId("ckred_index");

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();

  step("Open the import token modal");

  await tokensPagePo.getSettingsButtonPo().click();
  const importButtonPo = tokensPagePo.getImportTokenButtonPo();
  await importButtonPo.waitFor();
  await importButtonPo.click();

  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();
  await importTokenModalPo.waitFor();

  step("Enter the ledger and index canister ids");

  await formPo.getLedgerCanisterInputPo().typeText(testLedgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(testIndexCanisterId);
  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();
  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);

  step("Make every call to the index canister fail with an app label key");

  // The import is validated already, so the index canister can start to answer
  // with the text of its choice.
  await page.route(
    `**/api/*/canister/${testIndexCanisterId}/**`,
    async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: ATTACKER_MESSAGE,
      });
    }
  );

  step("Import the token and open its wallet");

  await reviewPo.getConfirmButtonPo().click();

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();

  step("The toast shows the app's own transactions error");

  const toastsPo = appPo.getToastsPo();
  // The import already showed its own success toast. Close it, so the
  // transactions error toast (which loads in the background and can take a
  // few retries) is the only one left to wait for.
  await toastsPo.getToastPo().waitFor();
  await toastsPo.closeAll();

  await expect(async () => {
    expect(await toastsPo.getMessages()).toContain(APP_TRANSACTIONS_ERROR);
  }).toPass({ timeout: 30_000 });

  const messages = await toastsPo.getMessages();

  expect(messages).not.toContain(ATTACKER_TARGET_TEXT);
  expect(messages).not.toContain(ATTACKER_MESSAGE);
});
