import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS participation", async ({ page, context }) => {
  await page.goto("/");
  await disableCssAnimations(page);

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("D001: User can see the list of new launches and proposals");
  await appPo.goToLaunchpad();

  await page.waitForTimeout(300);

  appPo.getLaunchpad2Po().getUpcomingLaunchesCardListPo();
  const upcomingLaunchesCards = await appPo
    .getLaunchpad2Po()
    .getUpcomingLaunchesCardListPo()
    .getCardEntries();

  expect(upcomingLaunchesCards.length).toBe(2);

  const projectsNames = await Promise.all(
    upcomingLaunchesCards.map((card) => card.getCardTitle())
  );
  expect(projectsNames).toEqual(["Bravo", "Charlie"]);

  step("D002: User can see the list of successful sales");
  await page.waitForTimeout(100);
  let committedProjectsCards = await appPo
    .getLaunchpad2Po()
    .getLaunchedProjectsCardListPo()
    .getCardEntries();
  expect(committedProjectsCards.length).toBeGreaterThan(1);

  step("D003: User can see the details of one sale");
  await page.waitForTimeout(100);

  committedProjectsCards = await appPo
    .getLaunchpad2Po()
    .getUpcomingLaunchesCardListPo()
    .getCardEntries();
  await committedProjectsCards[0].click();
  const projectDetail = appPo.getProjectDetailPo();
  await projectDetail.waitForContentLoaded();
  const projectName = await projectDetail.getProjectName();
  expect(projectName).toBe("Bravo");
  expect(await projectDetail.getTokenSymbol()).not.toBe("");
  expect(await projectDetail.getStatus()).toBe("Accepting Participation");

  await signInWithNewUser({ page, context });

  step("Get some ICP to participate in the sale");
  await appPo.goBack();
  await appPo.getIcpTokens(20);
  await committedProjectsCards[0].click();

  step("D004: User can participate in a sale");
  expect(await projectDetail.hasCommitmentAmount()).toBe(false);
  await projectDetail.participate({ amount: 5, acceptConditions: true });
  expect(await projectDetail.getCommitmentAmount()).toBe("5.00");

  step("D005: User can increase the participation in a sale");
  await projectDetail.participate({ amount: 8, acceptConditions: true });
  expect(await projectDetail.getCommitmentAmount()).toBe("13.00");
});
