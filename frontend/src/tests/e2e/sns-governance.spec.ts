import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test accounts requirements", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  await appPo
    .getSelectUniverseListPo()
    .getSelectUniverseCardPos({ expectedCount: 2 });

  const snsUniverseCards = await appPo
    .getSelectUniverseListPo()
    .getSnsUniverseCards();
  expect(snsUniverseCards).toHaveLength(1);
  const snsProjectName = await snsUniverseCards[0].getName();

  // Our test SNS project names are always 5 uppercase letters.
  expect(snsProjectName).toMatch(/[A-Z]{5}/);

  await snsUniverseCards[0].click();
  await appPo.getTokens(20);

  // TODO:
  // SN001: User can see the list of neurons

  // SN002: User can see the details of a neuron

  // SN003: User can add a hotkey

  // SN004: User can remove a hotkey

  // SN005: User can see the list of hotkeys of a neuron
});
