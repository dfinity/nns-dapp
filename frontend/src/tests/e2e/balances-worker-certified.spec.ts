import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Request } from "@playwright/test";

const TEST_TOKEN_NAME = "ckRED";

// Mirrors SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS in
// $lib/constants/accounts.constants.ts. A Playwright spec cannot import a
// frontend constant, so the value is copied.
const SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS = 30_000;

// Time to let the wallet page finish its own load calls before the measured
// window starts.
const SETTLE_MILLIS = 5_000;

// One full timer interval, plus room for the update call to complete.
const WINDOW_MILLIS = SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS + 15_000;

type BalanceCall = {
  // An ingress (update) call goes to /call. A query goes to /query.
  certified: boolean;
  url: string;
};

/**
 * The balances web worker polls the balance of the account the wallet page
 * shows. Before the fix it asked the ledger with an uncertified query first and
 * only sent the certified call when that query reported a different balance. A
 * single malicious replica could answer the query with the last known balance
 * and stop every certified read for the whole session.
 *
 * This spec watches the HTTP traffic to the ledger canister. After the page has
 * settled, every icrc1_balance_of request that the poll sends must be an
 * ingress call. The spec fails on `main`, where the steady-state tick sends a
 * query and no call.
 */
test("Balances worker polls the ledger with certified calls only", async ({
  page,
  context,
}) => {
  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const indexCanisterId = await dfxCanisterId("ckred_index");

  const balanceCalls: BalanceCall[] = [];

  // The worker runs in a dedicated web worker. Chromium reports its requests on
  // the page that owns it, so the context listener sees them.
  context.on("request", (request: Request) => {
    const url = request.url();

    if (!url.includes(`/canister/${ledgerCanisterId}/`)) {
      return;
    }

    // The agent sends CBOR. The method name is a text string inside it, so the
    // ASCII bytes appear verbatim in the body.
    const body = request.postDataBuffer();

    if (body === null || !body.includes("icrc1_balance_of")) {
      return;
    }

    balanceCalls.push({ certified: url.endsWith("/call"), url });
  });

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();

  step("Import the test token so the wallet page has an ICRC account");

  await tokensPagePo.getSettingsButtonPo().click();

  const importButtonPo = tokensPagePo.getImportTokenButtonPo();
  await importButtonPo.waitFor();
  await importButtonPo.click();

  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  await importTokenModalPo.waitFor();

  const formPo = importTokenModalPo.getImportTokenFormPo();
  await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(indexCanisterId);
  await formPo.getSubmitButtonPo().click();

  const reviewPo = importTokenModalPo.getImportTokenReviewPo();
  await reviewPo.waitFor();
  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);
  await reviewPo.getConfirmButtonPo().click();

  step("Wait for the wallet page to show a balance");

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();

  const headingPo = walletPo.getWalletPageHeadingPo();

  await expect
    .poll(() => headingPo.getTitle(), { timeout: 60_000 })
    .not.toBeNull();

  const balanceOnLoad = await headingPo.getTitle();

  step("Let the page settle, then measure one full poll interval");

  await page.waitForTimeout(SETTLE_MILLIS);

  const mark = balanceCalls.length;

  await page.waitForTimeout(WINDOW_MILLIS);

  const callsInWindow = balanceCalls.slice(mark);

  step("The poll must reach the ledger, and only with certified calls");

  // Fails closed: if the worker stopped polling, or if the requests never
  // reached this listener, the window is empty and this assertion fails.
  expect(callsInWindow.length).toBeGreaterThan(0);

  // The regression assertion. On `main` the steady-state tick sends a query and
  // this list holds a `false`.
  expect(callsInWindow.map(({ certified }) => certified)).toEqual(
    callsInWindow.map(() => true)
  );

  step("The balance on screen stays stable while the poll runs");

  // Nothing changed the account, so the certified poll must not change or clear
  // the value on screen. This guards the claim that the fix needs no design
  // change: no flicker, and no balance that disappears and comes back.
  expect(await headingPo.getTitle()).toBe(balanceOnLoad);
});
