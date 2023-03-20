import { expect, test } from "@playwright/test";
// TODO: Import with $tests and without .js file extension.
import { signInWithNewUser } from "../utils/e2e.test-utils.js";

test("Log in and click Send button", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });
  await page.getByRole("button", { name: "Send" }).click();
});
