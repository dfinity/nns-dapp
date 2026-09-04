import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

// Playwright cannot import $lib/i18n/en.json, so the expected texts are copied.
const IS_SNS_TOAST = "You cannot import SNS tokens, they are added by the NNS.";
const NOT_LOADED_TOAST =
  "The list of SNS projects is not loaded yet. Try again in a moment.";
const SNS_LIST_ERROR_TOAST =
  "There was an unexpected error while loading the summaries of all deployed projects.";

const AGGREGATOR_PAGE_URL = "**/sns/list/page/**";
const POLL_TIMEOUT = 60 * 1000;

test("Import token refuses an SNS ledger and fails closed without the SNS list", async ({
  page,
  context,
}) => {
  const ckRedLedgerCanisterId = await dfxCanisterId("ckred_ledger");
  const ckRedIndexCanisterId = await dfxCanisterId("ckred_index");

  // The SNS ledger canister IDs the app itself received from the aggregator.
  const snsLedgerCanisterIds: string[] = [];
  // Phase 3 blocks the aggregator to leave snsAggregatorStore.data undefined.
  let blockAggregator = false;

  await page.route(AGGREGATOR_PAGE_URL, async (route) => {
    if (blockAggregator) {
      await route.abort();
      return;
    }
    const response = await route.fetch();
    try {
      const body = await response.json();
      if (Array.isArray(body)) {
        for (const sns of body) {
          const ledgerCanisterId = sns?.canister_ids?.ledger_canister_id;
          if (typeof ledgerCanisterId === "string") {
            snsLedgerCanisterIds.push(ledgerCanisterId);
          }
        }
      }
    } catch {
      // Not JSON. Serve it unchanged.
    }
    await route.fulfill({ response });
  });

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();
  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();

  const toastMessages = async (): Promise<string> =>
    (await appPo.getToastsPo().getMessages()).join(" | ");

  const expectToast = async (text: string): Promise<void> => {
    await expect.poll(toastMessages, { timeout: POLL_TIMEOUT }).toContain(text);
  };

  const openImportForm = async (currentPage: Page): Promise<void> => {
    await currentPage.goto("/tokens");
    await disableCssAnimations(currentPage);
    await tokensPagePo.getSettingsButtonPo().click();
    await tokensPagePo.getImportTokenButtonPo().click();
    await importTokenModalPo.waitFor();
    await formPo.waitFor();
  };

  await step("A legitimate non-SNS token still passes validation");

  await openImportForm(page);
  await formPo.getLedgerCanisterInputPo().typeText(ckRedLedgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(ckRedIndexCanisterId);
  await formPo.getSubmitButtonPo().click();

  await reviewPo.waitFor();
  expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toBe(
    ckRedLedgerCanisterId
  );

  await step("The aggregator gave the app at least one SNS ledger canister ID");

  await expect
    .poll(() => snsLedgerCanisterIds.length, { timeout: POLL_TIMEOUT })
    .toBeGreaterThan(0);
  const snsLedgerCanisterId = snsLedgerCanisterIds[0];

  await step("The form refuses an SNS ledger canister ID");

  await openImportForm(page);
  await appPo.getToastsPo().closeAll();
  await formPo.getLedgerCanisterInputPo().typeText(snsLedgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(ckRedIndexCanisterId);
  await formPo.getSubmitButtonPo().click();

  await expectToast(IS_SNS_TOAST);
  // The form stays and the wizard never reaches the review step, so neither the
  // ledger nor the index canister was called.
  expect(await formPo.isPresent()).toBe(true);
  expect(await reviewPo.isPresent()).toBe(false);

  await step("Without the SNS list the URL import does not auto-submit");

  blockAggregator = true;
  await page.goto(
    `/tokens?import-ledger-id=${snsLedgerCanisterId}&import-index-id=${ckRedIndexCanisterId}`
  );
  await disableCssAnimations(page);
  await importTokenModalPo.waitFor();
  await formPo.waitFor();

  expect(await formPo.getLedgerCanisterInputPo().getValue()).toBe(
    snsLedgerCanisterId
  );
  expect(await formPo.getIndexCanisterInputPo().getValue()).toBe(
    ckRedIndexCanisterId
  );

  // The SNS list load has failed, so every load of the app init has settled.
  await expectToast(SNS_LIST_ERROR_TOAST);
  expect(await reviewPo.isPresent()).toBe(false);

  await step("Without the SNS list a manual submit fails closed");

  await appPo.getToastsPo().closeAll();
  await formPo.getSubmitButtonPo().click();

  await expectToast(NOT_LOADED_TOAST);
  expect(await formPo.isPresent()).toBe(true);
  expect(await reviewPo.isPresent()).toBe(false);
});
