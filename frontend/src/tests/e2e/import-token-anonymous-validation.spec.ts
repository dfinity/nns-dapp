import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  closeHighlight,
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Request } from "@playwright/test";

const TEST_TOKEN_NAME = "ckRED";

// The IC request envelope is CBOR. These two markers read the envelope without
// a CBOR parser.
//
// ANONYMOUS_SENDER is the field `sender` set to the anonymous principal:
// text(6) "sender" (0x66 + "sender") followed by bytes(1) 0x04.
const ANONYMOUS_SENDER = "6673656e6465724104";
// agent-js adds `sender_pubkey` and `sender_sig` only when an identity signs
// the envelope. An anonymous envelope carries neither field.
const SIGNED_MARKER = Buffer.from("sender_pubkey", "utf8").toString("hex");

type IcRequest = {
  url: string;
  bodyHex: string;
};

const isSigned = (request: IcRequest): boolean =>
  request.bodyHex.includes(SIGNED_MARKER);

// This test covers finding 22: an import-token deep link must not send the user
// principal to the canisters that the URL names. The user chose neither
// canister ID, and the modal calls both of them with no click.
test("Import token deep link validates the URL canisters anonymously", async ({
  page,
  context,
}) => {
  const ledgerCanisterId = await dfxCanisterId("ckred_ledger");
  const indexCanisterId = await dfxCanisterId("ckred_index");
  const nnsDappCanisterId = await dfxCanisterId("nns-dapp");

  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const requests: IcRequest[] = [];
  const recordRequest = (request: Request) => {
    const url = request.url();
    if (!url.includes("/api/v")) return;
    requests.push({
      url,
      bodyHex: (request.postDataBuffer() ?? Buffer.alloc(0)).toString("hex"),
    });
  };
  const requestsTo = (canisterId: string): IcRequest[] =>
    requests.filter((request) =>
      request.url.includes(`/canister/${canisterId}/`)
    );

  step("Open the import token deep link");

  page.on("request", recordRequest);

  await page.goto(
    `/tokens/?import-ledger-id=${ledgerCanisterId}&import-index-id=${indexCanisterId}`
  );
  await disableCssAnimations(page);
  await closeHighlight(page);

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const importTokenModalPo = appPo
    .getTokensPo()
    .getTokensPagePo()
    .getImportTokenModalPo();
  const reviewPo = importTokenModalPo.getImportTokenReviewPo();

  step("The review step opens without a click");

  await importTokenModalPo.waitFor();
  await reviewPo.waitFor();

  expect(await reviewPo.getTokenName()).toBe(TEST_TOKEN_NAME);
  expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toBe(
    ledgerCanisterId
  );
  expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toBe(
    indexCanisterId
  );

  // Everything above happened without a click. Stop recording here, because
  // the calls after the confirmation are allowed to carry the user identity.
  page.off("request", recordRequest);

  step("The zero click calls reach both URL canisters");

  const ledgerRequests = requestsTo(ledgerCanisterId);
  const indexRequests = requestsTo(indexCanisterId);
  expect(ledgerRequests.length).toBeGreaterThan(0);
  expect(indexRequests.length).toBeGreaterThan(0);

  step("The session is signed in, and a signed envelope is detectable");

  // Control for the two assertions below. The dapp loads the imported tokens
  // from its own backend canister in the same window, with the user identity.
  // If this call carried no signature, the checks below would pass for the
  // wrong reason.
  const nnsDappRequests = requestsTo(nnsDappCanisterId);
  expect(nnsDappRequests.length).toBeGreaterThan(0);
  expect(nnsDappRequests.filter(isSigned).length).toBeGreaterThan(0);

  step("No zero click call to the URL canisters carries the user identity");

  const urlCanisterRequests = [...ledgerRequests, ...indexRequests];
  expect(urlCanisterRequests.filter(isSigned).map(({ url }) => url)).toEqual(
    []
  );
  expect(
    urlCanisterRequests
      .filter(({ bodyHex }) => !bodyHex.includes(ANONYMOUS_SENDER))
      .map(({ url }) => url)
  ).toEqual([]);

  step("Confirm still imports the token with the user identity");

  await reviewPo.getConfirmButtonPo().click();

  const walletPo = appPo.getWalletPo().getIcrcWalletPo();
  await walletPo.waitFor();
  expect(
    await walletPo.getWalletPageHeaderPo().getUniverseSummaryPo().getTitle()
  ).toEqual(TEST_TOKEN_NAME);

  step("The imported token is present in the tokens table");

  await appPo.goBack();
  await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getImportedTokensTable()
    .waitFor();
  expect(
    await appPo
      .getTokensPo()
      .getTokensPagePo()
      .getImportedTokensTable()
      .getTokenNames()
  ).toContain(TEST_TOKEN_NAME);
});
