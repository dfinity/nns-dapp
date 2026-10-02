import { SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS } from "$lib/constants/accounts.constants";
import { DEFAULT_INDEX_TRANSACTION_MAX_PAGES } from "$lib/constants/constants";
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

// Time to let the wallet page finish its own load calls before the measured
// window starts.
const SETTLE_MILLIS = 5_000;

// Two full timer intervals, plus room for the calls of the last tick to
// complete. The window must hold more than one tick, otherwise the spec cannot
// tell a bounded tick from a tick that never ends.
const WINDOW_MILLIS = 2 * SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS + 10_000;

// One sync sends its pages back to back, one network round trip each. Two syncs
// are SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS apart. Any gap above this value
// therefore starts a new sync.
const BURST_GAP_MILLIS = 5_000;

type IndexCall = {
  at: number;
};

/**
 * The transactions web worker pages the index canister. Before the fix it
 * called itself again whenever the oldest transaction id of a page was above
 * the most recent id it knew. Nothing required that id to go down, and nothing
 * capped the number of pages, so an index canister that keeps answering ids
 * above the known one makes one sync run without an end.
 *
 * This spec watches the HTTP traffic to the index canister of an imported
 * token. It groups the get_account_transactions requests into syncs and checks
 * that no sync sends more than DEFAULT_INDEX_TRANSACTION_MAX_PAGES requests.
 *
 * The local index canister is honest, so this spec bounds the honest path and
 * proves the loop still polls and still feeds the page. The hostile index is
 * pinned by the unit tests in
 * src/tests/lib/worker-services/icrc-transactions.worker-services.spec.ts,
 * which fail on `main`.
 */
test("Transactions worker sends a bounded number of index calls per sync", async ({
  page,
  context,
}) => {
  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const indexCanisterId = await dfxCanisterId("ckred_index");

  const indexCalls: IndexCall[] = [];

  // The worker runs in a dedicated web worker. Chromium reports its requests on
  // the page that owns it, so the context listener sees them.
  context.on("request", (request: Request) => {
    const url = request.url();

    if (!url.includes(`/canister/${indexCanisterId}/`)) {
      return;
    }

    // The agent sends CBOR. The method name is a text string inside it, so the
    // ASCII bytes appear verbatim in the body.
    const body = request.postDataBuffer();

    if (body === null || !body.includes("get_account_transactions")) {
      return;
    }

    indexCalls.push({ at: Date.now() });
  });

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();

  await step("Import the test token so the wallet page has an ICRC account");

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

  await step("Wait for the wallet page of the imported token");

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();

  // The new user made no transaction with this token, so the list settles on
  // the empty state. It also proves the transactions path of the page finished.
  await expect
    .poll(() => walletPo.hasNoTransactions(), { timeout: 60_000 })
    .toBe(true);

  await step("Let the page settle, then measure two full sync intervals");

  await page.waitForTimeout(SETTLE_MILLIS);

  const mark = indexCalls.length;

  await page.waitForTimeout(WINDOW_MILLIS);

  const callsInWindow = indexCalls.slice(mark);

  await step("Every sync must stay under the page cap");

  // Fails closed: if the worker stopped polling, or if the requests never
  // reached this listener, the window is empty and this assertion fails.
  expect(callsInWindow.length).toBeGreaterThan(0);

  const syncSizes: number[] = [];
  let previousAt: number | undefined = undefined;

  for (const { at } of callsInWindow) {
    if (previousAt === undefined || at - previousAt > BURST_GAP_MILLIS) {
      syncSizes.push(1);
    } else {
      syncSizes[syncSizes.length - 1] += 1;
    }

    previousAt = at;
  }

  expect(Math.max(...syncSizes)).toBeLessThanOrEqual(
    DEFAULT_INDEX_TRANSACTION_MAX_PAGES
  );

  await step("The page still shows the transactions list");

  // A sync that never ends never posts its result, and the list would fall back
  // to the loading state. It must still show the empty state.
  expect(await walletPo.hasNoTransactions()).toBe(true);
});
