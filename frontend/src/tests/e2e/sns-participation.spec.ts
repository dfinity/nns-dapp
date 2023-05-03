import { AppPo } from "$tests/page-objects/App.page-object";
import { ProjectCardPo } from "$tests/page-objects/ProjectCard.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS participation", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  await appPo.goToLaunchpad();

  // D001: User can see the list of open sales
  await appPo.getLaunchpadPo().getOpenProjectsPo().waitForContentLoaded();
  const openProjects: ProjectCardPo[] = await appPo
    .getLaunchpadPo()
    .getOpenProjectsPo()
    .getProjectCardPos();
  expect(openProjects.length).toBe(1);

  // D002: User can see the list of successful sales
  await appPo.getLaunchpadPo().getCommittedProjectsPo().waitForContentLoaded();
  const committedProjects: ProjectCardPo[] = await appPo
    .getLaunchpadPo()
    .getCommittedProjectsPo()
    .getProjectCardPos();
  expect(committedProjects.length).toBeGreaterThan(1);

  // D003: User can see the details of one sale
  const snsProjectName = await openProjects[0].getProjectName();
  await openProjects[0].click();
  const projectDetail = appPo.getProjectDetailPo();
  await projectDetail.waitForContentLoaded();
  const tokenSymbol = await projectDetail.getTokenSymbol();
  expect(`Project ${tokenSymbol}`).toBe(snsProjectName);
  expect(await projectDetail.getStatus()).toBe("Accepting Participation");

  // D004: User can participate in a sale
  // TODO

  // D005: User can increase the participation in a sale
  // TODO
});
