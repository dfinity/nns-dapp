import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

// A canister principal. It keeps the expected account text short and fixed.
const OWNER = "rrkah-fqaaa-aaaaa-aaaaq-cai";

// The largest u64, and a common account ID. It is above
// Number.MAX_SAFE_INTEGER, so it is the value the old code read as hexadecimal.
const U64_MAX = "18446744073709551615";

// The account for the decimal value of U64_MAX.
const U64_MAX_AS_DECIMAL = `${OWNER}-pxt75ay.ffffffffffffffff`;

// The account the old code produced. It read the same digits as hexadecimal.
const U64_MAX_AS_HEX = `${OWNER}-rtjdh2q.18446744073709551615`;

// 2**256 - 1 is the largest subaccount. It has 78 decimal digits.
const MAX_SUBACCOUNT = (2n ** 256n - 1n).toString();
const MAX_SUBACCOUNT_ACCOUNT = `${OWNER}-37tqaua.${"f".repeat(64)}`;

// One digit more than the largest subaccount holds.
const TOO_LARGE_SUBACCOUNT = "1" + "0".repeat(78);

// A paste that is far longer than any real ID. The parser must reject it
// without a long BigInt conversion.
const VERY_LONG_INPUT = "1".repeat(200000);

// The panel drops a key that arrives within this delay of the one before it.
const KEY_DEBOUNCE_MS = 100;

const SUBACCOUNT_ERROR =
  "Invalid subaccount. Use a number, a 0x-prefixed hex, or a 64-char hex string.";

const openEncodeUtil = async (page: Page) => {
  const palette = page.getByTestId("alfred-component");

  await page.getByTestId("open-alfred").click();
  await expect(palette).toBeVisible();
  await palette.getByTestId("alfred-input").fill("Encode ICRC-1 Account");
  await palette.getByTestId("alfred-result-button").first().click();
  await expect(palette.getByTestId("alfred-util-principal")).toBeVisible();
};

// The parse function is pure, and the component spec at
// `src/tests/lib/components/alfred/BuildIcrcAccountUtil.spec.ts` covers every
// value. This spec covers what that one cannot: the util is reachable through
// the command palette, and a very long paste does not freeze the tab.
//
// `test.fixme` because no local replica runs on the review machine.
// `dfx start --pocketic` fails: dfx 0.32.0 ships pocket-ic-server 13.0.0, and
// that server rejects the saved snsdemo snapshot state. Remove `.fixme` when
// the replica starts again.
test.fixme(
  "Encode ICRC-1 Account reads a decimal subaccount ID as decimal",
  async ({ page, browser }) => {
    const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
    const palette = page.getByTestId("alfred-component");
    const output = palette.getByTestId("alfred-util-hex-output");
    const error = palette.locator(".error-message");
    const principalInput = palette.getByTestId("alfred-util-principal");
    const subaccountInput = palette.getByTestId("alfred-util-subaccount");

    await page.goto("/");
    await expect(page).toHaveTitle("Portfolio | Network Nervous System");

    await step("Sign in");
    await signInWithNewUser({ page, context: browser.contexts()[0] });

    await step("Open the Encode ICRC-1 Account util from the palette");
    await openEncodeUtil(page);

    await step("A small decimal ID is unchanged");
    await principalInput.fill(OWNER);
    await subaccountInput.fill("12345");
    await expect(output).toHaveText(`${OWNER}-xhbeadi.3039`);

    await step("A decimal ID above MAX_SAFE_INTEGER reads as decimal");
    await subaccountInput.fill(U64_MAX);
    await expect(output).toHaveText(U64_MAX_AS_DECIMAL);

    await step("That ID is never read as hexadecimal");
    // This is the whole finding. The old code produced U64_MAX_AS_HEX here, and
    // a deposit to it landed on another subaccount.
    await expect(output).not.toHaveText(U64_MAX_AS_HEX);

    await step("Leading zeros do not change the account");
    await subaccountInput.fill(`${"0".repeat(40)}12345`);
    await expect(output).toHaveText(`${OWNER}-xhbeadi.3039`);

    await step("The largest subaccount, 2**256 - 1, is accepted");
    await subaccountInput.fill(MAX_SUBACCOUNT);
    await expect(output).toHaveText(MAX_SUBACCOUNT_ACCOUNT);

    await step("A decimal ID above 32 bytes shows the error");
    await subaccountInput.fill(TOO_LARGE_SUBACCOUNT);
    await expect(error).toHaveText(SUBACCOUNT_ERROR);
    await expect(output).toBeHidden();

    await step("A 0x-prefixed hex ID still works");
    await subaccountInput.fill("0xffffffffffffffff");
    await expect(output).toHaveText(U64_MAX_AS_DECIMAL);

    await step("A very long paste shows the error and does not freeze the tab");
    await subaccountInput.fill(VERY_LONG_INPUT);
    await expect(error).toHaveText(SUBACCOUNT_ERROR);

    await step("The util still answers after that paste");
    await subaccountInput.fill(U64_MAX);
    await expect(output).toHaveText(U64_MAX_AS_DECIMAL);

    await step("Escape closes the util and then the palette");
    await page.keyboard.press("Escape");
    await expect(palette.getByTestId("alfred-input")).toBeVisible();
    await page.waitForTimeout(KEY_DEBOUNCE_MS);
    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();

    await appPo.waitForNotBusy();
  }
);
