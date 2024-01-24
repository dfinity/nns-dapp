import { AppPo } from "$tests/page-objects/App.page-object";
import type { ProjectCardPo } from "$tests/page-objects/ProjectCard.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS participation", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("D001: User can see the list of open sales");
  await appPo.goToLaunchpad();

  await appPo.getLaunchpadPo().getOpenProjectsPo().waitForContentLoaded();
  const openProjects: ProjectCardPo[] = await appPo
    .getLaunchpadPo()
    .getOpenProjectsPo()
    .getProjectCardPos();
  expect(openProjects.length).toBe(1);

  step("D002: User can see the list of successful sales");
  await appPo.getLaunchpadPo().getCommittedProjectsPo().waitForContentLoaded();
  const committedProjects: ProjectCardPo[] = await appPo
    .getLaunchpadPo()
    .getCommittedProjectsPo()
    .getProjectCardPos();
  expect(committedProjects.length).toBeGreaterThan(1);

  step("D003: User can see the details of one sale");
  const snsProjectName = await openProjects[0].getProjectName();
  await openProjects[0].click();
  const projectDetail = appPo.getProjectDetailPo();
  await projectDetail.waitForContentLoaded();
  const projectName = await projectDetail.getProjectName();
  expect(projectName).toBe(snsProjectName);
  expect(await projectDetail.getTokenSymbol()).not.toBe("");
  expect(await projectDetail.getStatus()).toBe("Accepting Participation");

  await signInWithNewUser({ page, context });

  step("Get some ICP to participate in the sale");
  await appPo.goBack();
  await appPo.getIcpTokens(20);
  await openProjects[0].click();

  step("D004: User can participate in a sale");
  expect(await projectDetail.hasCommitmentAmount()).toBe(false);
  await projectDetail.participate({ amount: 5, acceptConditions: true });
  expect(await projectDetail.getCommitmentAmount()).toBe("5.00");

  step("D005: User can increase the participation in a sale");
  await projectDetail.participate({ amount: 8, acceptConditions: true });
  expect(await projectDetail.getCommitmentAmount()).toBe("13.00");
});
