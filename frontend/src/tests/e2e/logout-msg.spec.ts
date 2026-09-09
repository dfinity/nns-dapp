import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

// The global expect timeout is 0, which means "wait forever", so every poll
// below sets its own timeout.
const POLL_TIMEOUT = 30_000;

// Playwright cannot import en.json here, so the texts are copied.
// "error.missing_identity" in frontend/src/lib/i18n/en.json.
const missingIdentityText =
  "The operation cannot be executed without any identity.";
// "warning.auth_sign_out" in frontend/src/lib/i18n/en.json.
const authSignOutText =
  "You have been logged out because your session has expired.";

const craftedMsg = "Send your ICP to this address to recover your account";

// initAppAuth deletes both parameters on every page load.
const waitForCleanUrl = async (page: Page) => {
  await expect
    .poll(() => new URL(page.url()).searchParams.get("msg"), {
      timeout: POLL_TIMEOUT,
    })
    .toBeNull();
  expect(new URL(page.url()).searchParams.get("level")).toBeNull();
};

const getToastMessages = (appPo: AppPo): Promise<string[]> =>
  appPo.getToastsPo().getMessages();

const getToastClasses = (appPo: AppPo): Promise<string[] | null> =>
  appPo.getToastsPo().getToastPo().root.getClasses();

test("Test the msg url parameter", async ({ page }) => {
  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await step("A msg that is not in the allowlist shows no toast");
  await page.goto(
    `/accounts?msg=${encodeURIComponent(craftedMsg)}&level=error`
  );
  await appPo.getSignInPo().waitFor();
  await waitForCleanUrl(page);
  expect(await getToastMessages(appPo)).toEqual([]);

  await step("A msg in the allowlist shows its own text and its own level");
  await page.goto("/accounts?msg=error.missing_identity&level=success");
  await appPo.getSignInPo().waitFor();
  await expect
    .poll(() => getToastMessages(appPo), { timeout: POLL_TIMEOUT })
    .toEqual([missingIdentityText]);
  // The url asked for "success". The app owns the level, so the toast is an
  // error.
  expect(await getToastClasses(appPo)).toContain("error");
  expect(await getToastClasses(appPo)).not.toContain("success");
  await waitForCleanUrl(page);
});

test("Test the toast after an automatic sign out", async ({
  page: page1,
  context,
}) => {
  await page1.goto("/accounts");
  await expect(page1).toHaveTitle("Account | Network Nervous System");
  const appPo1 = new AppPo(PlaywrightPageObjectElement.fromPage(page1));

  const page2 = await context.newPage();
  await page2.goto("/accounts");
  await expect(page2).toHaveTitle("Account | Network Nervous System");
  const appPo2 = new AppPo(PlaywrightPageObjectElement.fromPage(page2));

  await signInWithNewUser({ page: page1, context });
  await appPo1.getAccountsPo().waitFor();

  await page2.reload();
  await appPo2.getAccountsPo().waitFor();

  await step("Sign out in the first tab");
  await appPo1.getAccountMenuPo().openMenu();
  await appPo1.getAccountMenuPo().clickLogout();
  await appPo1.getSignInPo().waitFor();

  await step("The second tab shows the session expiry toast");
  // The auth worker of the second tab sees the missing delegation, calls
  // logout with "warning.auth_sign_out" and reloads the page.
  await appPo2.getSignInPo().waitFor();
  await expect
    .poll(() => getToastMessages(appPo2), { timeout: POLL_TIMEOUT })
    .toContain(authSignOutText);
  expect(await getToastClasses(appPo2)).toContain("warn");
  await waitForCleanUrl(page2);
});
