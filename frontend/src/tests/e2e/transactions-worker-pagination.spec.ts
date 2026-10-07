import { SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS } from "$lib/constants/accounts.constants";
import {
  DEFAULT_INDEX_TRANSACTION_MAX_PAGES,
  DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT,
} from "$lib/constants/constants";
import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { UiTransactionsListPo } from "$tests/page-objects/UiTransactionsList.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { createAgent } from "@dfinity/utils";
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity";
import { Principal } from "@icp-sdk/core/principal";
import {
  expect,
  test,
  type BrowserContext,
  type Page,
  type Request,
} from "@playwright/test";

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

// Public test identity of `dev.api.ts`. Its account holds the test tokens of
// the local replica.
const TEST_ACCOUNT_PUBLIC_KEY = "Uu8wv55BKmk9ZErr6OIt5XR1kpEGXcOSOC1OYzrAwuk=";
const TEST_ACCOUNT_PRIVATE_KEY =
  "N3HB8Hh2PrWqhWH2Qqgr1vbU9T3gb1zgdBD8ZOdlQnVS7zC/nkEqaT1kSuvo4i3ldHWSkQZdw5I4LU5jOsDC6Q==";

const LOCAL_REPLICA_HOST = "http://localhost:8080";

// Each page of the index starts at the oldest id of the page before it, so two
// pages share one row. A sync that hits the cap therefore holds fewer rows than
// this number, and the remaining rows go to the backlog.
const BACKLOG_TRANSFERS =
  DEFAULT_INDEX_TRANSACTION_MAX_PAGES * DEFAULT_INDEX_TRANSACTION_PAGE_LIMIT +
  30;

const recordIndexCalls = ({
  context,
  indexCanisterId,
}: {
  context: BrowserContext;
  indexCanisterId: string;
}): IndexCall[] => {
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

  return indexCalls;
};

// One sync sends its pages back to back. A gap above BURST_GAP_MILLIS starts a
// new sync. Returns the number of calls of each sync.
const groupIntoSyncs = (calls: IndexCall[]): number[] => {
  const syncSizes: number[] = [];
  let previousAt: number | undefined = undefined;

  for (const { at } of calls) {
    if (previousAt === undefined || at - previousAt > BURST_GAP_MILLIS) {
      syncSizes.push(1);
    } else {
      syncSizes[syncSizes.length - 1] += 1;
    }

    previousAt = at;
  }

  return syncSizes;
};

const importTestToken = async ({
  appPo,
  ledgerCanisterId,
  indexCanisterId,
}: {
  appPo: AppPo;
  ledgerCanisterId: string;
  indexCanisterId: string;
}): Promise<void> => {
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();

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
};

const createTestAccountLedger = async (
  ledgerCanisterId: string
): Promise<IcrcLedgerCanister> => {
  const fromBase64 = (text: string) =>
    Uint8Array.from(Buffer.from(text, "base64"));

  const identity = Ed25519KeyIdentity.fromKeyPair(
    fromBase64(TEST_ACCOUNT_PUBLIC_KEY),
    fromBase64(TEST_ACCOUNT_PRIVATE_KEY)
  );

  const agent = await createAgent({
    identity,
    host: LOCAL_REPLICA_HOST,
    fetchRootKey: true,
  });

  return IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerCanisterId),
  });
};

// Sends `count` transfers of 1 ulp each, all at the same time. A distinct memo
// keeps the ledger from deduplicating them.
const sendTransfers = async ({
  ledger,
  owner,
  count,
}: {
  ledger: IcrcLedgerCanister;
  owner: Principal;
  count: number;
}): Promise<void> => {
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      ledger.transfer({
        amount: 1n,
        to: { owner, subaccount: [] },
        memo: new TextEncoder().encode(`pagination-${index}`),
      })
    )
  );
};

const countTransactionCards = async (page: Page): Promise<number> =>
  (
    await UiTransactionsListPo.under(
      PlaywrightPageObjectElement.fromPage(page)
    ).getTransactionCardPos()
  ).length;

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

  const indexCalls = recordIndexCalls({ context, indexCanisterId });

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await step("Import the test token so the wallet page has an ICRC account");

  await importTestToken({ appPo, ledgerCanisterId, indexCanisterId });

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

  const syncSizes = groupIntoSyncs(callsInWindow);

  expect(Math.max(...syncSizes)).toBeLessThanOrEqual(
    DEFAULT_INDEX_TRANSACTION_MAX_PAGES
  );

  await step("The page still shows the transactions list");

  // A sync that never ends never posts its result, and the list would fall back
  // to the loading state. It must still show the empty state.
  expect(await walletPo.hasNoTransactions()).toBe(true);
});

/**
 * When more new transactions arrive between two syncs than the page cap can
 * hold, the sync that hits the cap keeps a backlog cursor. The next syncs page
 * down from that cursor, so the wallet gets every transaction and not only the
 * newest pages.
 *
 * The spec sends one transfer, lets the worker store it as the most recent
 * transaction, then sends BACKLOG_TRANSFERS transfers between two syncs. It
 * expects one sync to hit the cap, no sync to go above it, and the wallet to
 * show every transaction at the end.
 */
test("Transactions worker fetches the transactions beyond the page cap in the next syncs", async ({
  page,
  context,
}) => {
  test.setTimeout(420_000);

  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const indexCanisterId = await dfxCanisterId("ckred_index");

  const indexCalls = recordIndexCalls({ context, indexCanisterId });

  await page.goto("/canisters");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await step("Send one transfer to the new user");

  const owner = Principal.fromText(await appPo.getCanistersPo().getPrincipal());
  const ledger = await createTestAccountLedger(ledgerCanisterId);

  await sendTransfers({ ledger, owner, count: 1 });

  await step("Import the test token and wait for the first transaction");

  await appPo.goToAccounts();
  await importTestToken({ appPo, ledgerCanisterId, indexCanisterId });

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();

  await expect
    .poll(() => countTransactionCards(page), { timeout: 60_000 })
    .toBe(1);

  await step("Wait for a sync, so the worker stores the most recent id");

  const callsBeforeSync = indexCalls.length;

  await expect
    .poll(() => indexCalls.length, {
      timeout: SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS + 15_000,
    })
    .toBeGreaterThan(callsBeforeSync);

  // Let the calls of this sync end before the next sync is measured.
  await page.waitForTimeout(BURST_GAP_MILLIS + 1_000);

  const mark = indexCalls.length;

  await step("Send more transfers than the page cap holds, between two syncs");

  const sendStartedAt = Date.now();
  await sendTransfers({ ledger, owner, count: BACKLOG_TRANSFERS });

  // All the transfers must land before the next sync, or the cap is not hit.
  expect(Date.now() - sendStartedAt).toBeLessThan(
    SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS - BURST_GAP_MILLIS
  );

  await step("The wallet shows every transaction after the next syncs");

  await expect
    .poll(() => countTransactionCards(page), {
      timeout: 3 * SYNC_ACCOUNTS_TIMER_INTERVAL_MILLIS + 30_000,
    })
    .toBe(BACKLOG_TRANSFERS + 1);

  // Let a sync that is still in progress end.
  await page.waitForTimeout(BURST_GAP_MILLIS + 1_000);

  const syncSizes = groupIntoSyncs(indexCalls.slice(mark));

  // One sync hit the cap, which is the path that keeps a backlog.
  expect(syncSizes).toContain(DEFAULT_INDEX_TRANSACTION_MAX_PAGES);
  expect(Math.max(...syncSizes)).toBeLessThanOrEqual(
    DEFAULT_INDEX_TRANSACTION_MAX_PAGES
  );
});
