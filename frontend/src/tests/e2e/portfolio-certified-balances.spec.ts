import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test, type Request } from "@playwright/test";

// The Portfolio page must confirm every token balance with a certified update
// call. Before the fix it loaded every SNS and ck token balance with a query
// call only, so one malicious replica could show a forged balance.
//
// The IC HTTP interface uses one path per call type:
//   /api/v2/canister/<canisterId>/query -> uncertified query call
//   /api/v3/canister/<canisterId>/call  -> certified update call
//
// The CBOR request body carries the method name as a plain text string, so the
// test selects the balance calls by searching the raw body for
// "icrc1_balance_of". No CBOR parser is needed.

const CALL_PATH_PATTERN = /^\/api\/v\d+\/canister\/([^/]+)\/(query|call)$/;

const BALANCE_METHOD = "icrc1_balance_of";

test("Portfolio balances are confirmed with certified update calls", async ({
  page,
  context,
}) => {
  const queriedLedgers = new Set<string>();
  const updatedLedgers = new Set<string>();

  page.on("request", (request: Request) => {
    if (request.method() !== "POST") {
      return;
    }

    const match = CALL_PATH_PATTERN.exec(new URL(request.url()).pathname);
    if (match === null) {
      return;
    }

    const body = request.postDataBuffer();
    if (body === null) {
      return;
    }
    if (!body.toString("latin1").includes(BALANCE_METHOD)) {
      return;
    }

    const [, canisterId, callType] = match;
    if (callType === "query") {
      queriedLedgers.add(canisterId);
    } else {
      updatedLedgers.add(canisterId);
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const portfolioPagePo = appPo.getPortfolioPo().getPortfolioPagePo();

  await step("Wait for the Portfolio page to load the balances");
  await portfolioPagePo.getTotalAssetsCardPo().waitForLoaded();

  await step("The Portfolio page reads at least one ledger balance");
  await expect
    .poll(() => queriedLedgers.size, { timeout: 60_000 })
    .toBeGreaterThan(0);

  await step(
    "Every ledger that got a balance query also gets a balance update"
  );
  // On main this list keeps every queried ledger, because the Portfolio page
  // sends no update call at all.
  await expect
    .poll(
      () => [...queriedLedgers].filter((id) => !updatedLedgers.has(id)).sort(),
      { timeout: 60_000 }
    )
    .toEqual([]);

  await step("No ledger gets an update call without a query call");
  // The query answer must still show first, so an update call alone would mean
  // the page waits for the certified answer to render a balance.
  expect(
    [...updatedLedgers].filter((id) => !queriedLedgers.has(id)).sort()
  ).toEqual([]);
});
