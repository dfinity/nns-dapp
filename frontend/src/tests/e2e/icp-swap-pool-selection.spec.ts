import type { IcpSwapTicker } from "$lib/types/icp-swap";
import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  dfxCanisterId,
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// The ICP price in USD that the banner shows is the `last_price` of the
// ckUSDC ticker. The app formats it with `Intl.NumberFormat("fr-FR")` and two
// fraction digits, so 4 becomes "4,00" and 400 becomes "400,00".
const REAL_ICP_PRICE = "4";
const ATTACKER_ICP_PRICE = "400";
const REAL_ICP_PRICE_SHOWN = "4,00";

const ticker = (overrides: Partial<IcpSwapTicker>): IcpSwapTicker => ({
  ticker_id: "ne2vj-6yaaa-aaaag-qb3ia-cai",
  ticker_name: "CKUSDC_ICP",
  base_id: "2ouva-viaaa-aaaaq-aaamq-cai",
  base_currency: "ckUSDC",
  target_id: "ryjl3-tyaaa-aaaaa-aaaba-cai",
  target_currency: "ICP",
  last_price: "1",
  base_volume: "0",
  target_volume: "0",
  base_volume_24H: "0",
  target_volume_24H: "0",
  total_volume_usd: "0",
  volume_usd_24H: "0",
  fee_usd: "0",
  liquidity_in_usd: "0",
  ...overrides,
});

test("The ICP price comes from the most liquid ICPSwap pool", async ({
  page,
  context,
}) => {
  const icpLedgerCanisterId = await dfxCanisterId("nns-ledger");
  const ckusdcLedgerCanisterId = await dfxCanisterId("ckusdc_ledger");

  // The real ckUSDC pool holds value but nobody traded it in the last 24
  // hours. This is true of 296 of the 407 ICP pairs in the live feed.
  const realCkusdcTicker = ticker({
    base_id: ckusdcLedgerCanisterId,
    target_id: icpLedgerCanisterId,
    last_price: REAL_ICP_PRICE,
    liquidity_in_usd: "617000",
    volume_usd_24H: "0",
  });

  // Anybody can create a second ICPSwap pool for the same pair. This one holds
  // almost nothing, carries one wash trade and reports an outlier price. The
  // old code selected it, because it was the first ticker with a volume.
  const attackerCkusdcTicker = ticker({
    base_id: ckusdcLedgerCanisterId,
    target_id: icpLedgerCanisterId,
    last_price: ATTACKER_ICP_PRICE,
    liquidity_in_usd: "5",
    volume_usd_24H: "1",
  });

  let tickersRequested = false;
  await page.route("**/tickers", async (route) => {
    tickersRequested = true;
    await route.fulfill({
      // The attacker pool comes first, the order an attacker would want.
      json: [attackerCkusdcTicker, realCkusdcTicker],
    });
  });

  await page.goto("/accounts");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Account | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const usdValueBannerPo = appPo
    .getAccountsPo()
    .getNnsAccountsPo()
    .getUsdValueBannerPo();
  await usdValueBannerPo.waitFor();

  // The app asks ICPSwap for the tickers only when the network configures an
  // ICPSwap URL. `dfx.json` gives that URL to mainnet, app and beta, not to
  // the local network, so the local app shows no price at all.
  await page.waitForTimeout(5_000);
  test.skip(
    !tickersRequested,
    "This network configures no ICPSwap URL, so the app requests no tickers."
  );

  step("The banner shows the price of the most liquid pool");

  const icpPrice = await usdValueBannerPo.getIcpPrice();
  expect(icpPrice).toBe(REAL_ICP_PRICE_SHOWN);
  expect(await usdValueBannerPo.hasError()).toBe(false);
});
