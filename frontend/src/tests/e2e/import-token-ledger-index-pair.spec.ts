import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

const TEST_TOKEN_NAME = "ckRED";

// An IC ingress envelope of an anonymous caller carries `sender` as the single
// byte 0x04 and no `sender_pubkey` field. In CBOR that is the hex sequence
// below: 66 "sender" (text of 6 bytes), 41 (byte string of 1 byte), 04.
const ANONYMOUS_SENDER_HEX = "6673656e6465724104";

type IcCall = {
  canisterId: string;
  method: string;
  anonymous: boolean;
};

// The candid method name travels as plain ASCII inside the CBOR envelope, so a
// substring test finds it without a CBOR parser.
const METHOD_NAMES = ["icrc106_get_index_principal", "ledger_id"];

const recordIcCalls = (page: Page): IcCall[] => {
  const calls: IcCall[] = [];

  page.on("request", (request) => {
    if (request.method() !== "POST") return;

    const match = request
      .url()
      .match(/\/api\/v\d+\/canister\/([a-z0-9-]+)\/(?:call|query)$/);
    if (match === null) return;

    const body = request.postDataBuffer();
    if (body === null) return;

    const ascii = body.toString("latin1");
    const method = METHOD_NAMES.find((name) => ascii.includes(name));
    if (method === undefined) return;

    calls.push({
      canisterId: match[1],
      method,
      anonymous: body.toString("hex").includes(ANONYMOUS_SENDER_HEX),
    });
  });

  return calls;
};

test("The ledger canister verifies the index canister pair", async ({
  page,
  context,
}) => {
  const testLedgerCanisterId = await dfxCanisterId("ckred_ledger");
  const testIndexCanisterId = await dfxCanisterId("ckred_index");

  const calls = recordIcCalls(page);

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const tokensPagePo = appPo.getTokensPo().getTokensPagePo();

  await tokensPagePo.getSettingsButtonPo().click();

  const importButtonPo = tokensPagePo.getImportTokenButtonPo();

  await step("Open the import token modal");

  await importButtonPo.waitFor();
  await importButtonPo.click();

  const importTokenModalPo = tokensPagePo.getImportTokenModalPo();
  const formPo = importTokenModalPo.getImportTokenFormPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();

  await importTokenModalPo.waitFor();

  await step("Enter the ledger and the index canister ID");

  await formPo.getLedgerCanisterInputPo().typeText(testLedgerCanisterId);
  await formPo.getIndexCanisterInputPo().typeText(testIndexCanisterId);

  // The pair check runs between the submit click and the review step.
  await formPo.getSubmitButtonPo().click();
  await reviewPo.waitFor();

  await step("The pair check asks the ledger canister first");

  const ledgerCalls = calls.filter(
    ({ method }) => method === "icrc106_get_index_principal"
  );
  const indexCalls = calls.filter(({ method }) => method === "ledger_id");

  // Acceptance 1: the app asks the ledger canister, which is the trusted side
  // of the pair, with ICRC-106.
  expect(ledgerCalls.length).toBeGreaterThan(0);

  // Every ICRC-106 call goes to the ledger canister, never to the index
  // canister the user typed.
  expect(
    ledgerCalls.every(({ canisterId }) => canisterId === testLedgerCanisterId)
  ).toBe(true);

  // The user typed the ledger canister ID, so the call must not carry the
  // principal of the user to it.
  expect(ledgerCalls.every(({ anonymous }) => anonymous)).toBe(true);

  // The ledger is asked BEFORE the index canister, not after it.
  expect(
    calls.findIndex(({ method }) => method === "ledger_id")
  ).toBeGreaterThan(
    calls.findIndex(({ method }) => method === "icrc106_get_index_principal")
  );

  await step("The ledger names no index canister, so the old check still runs");

  // Acceptance 2: the snsdemo `ckred_ledger` is installed with no
  // `index_principal`, so the ledger answers IndexPrincipalNotSet and the
  // fallback asks the index canister for its `ledger_id`.
  expect(indexCalls.length).toBeGreaterThan(0);
  expect(
    indexCalls.every(({ canisterId }) => canisterId === testIndexCanisterId)
  ).toBe(true);

  await step("The import completes through the fallback");

  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);
  expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toBe(
    testLedgerCanisterId
  );
  expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toBe(
    testIndexCanisterId
  );

  await reviewPo.getConfirmButtonPo().click();

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();

  expect(
    await walletPo.getWalletPageHeaderPo().getUniverseSummaryPo().getTitle()
  ).toEqual(TEST_TOKEN_NAME);
});
