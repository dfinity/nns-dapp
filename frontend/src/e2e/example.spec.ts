import { signInWithNewUser } from "$utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Log in and click Send button", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });
  await page.getByRole("button", { name: "Send" }).click();
});
