import { AppPo } from "$tests/page-objects/App.page-object";
import { ProjectCommitmentPo } from "$tests/page-objects/ProjectCommitment.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// The swap participant count must come from the certified `get_derived_state`
// call. The removed code read it from `https://<swap>.raw.icp0.io/metrics`,
// which the raw gateway serves without response certification.
const RAW_METRICS_PATTERN = /\.raw\.(icp0\.io|ic0\.app)\/metrics/;

// playwright.config.ts sets expect.timeout to 0, so every poll needs its own.
const POLL_TIMEOUT = 60_000;

test("Test SNS swap participant count", async ({ page, context }) => {
  const requestedUrls: string[] = [];
  page.on("request", (request) => requestedUrls.push(request.url()));

  const rawMetricsRequests = () =>
    requestedUrls.filter((url) => RAW_METRICS_PATTERN.test(url));

  await page.goto("/");
  await disableCssAnimations(page);

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const projectCommitmentPo = ProjectCommitmentPo.under(pageElement);
  const projectDetail = appPo.getProjectDetailPo();

  step("Open the detail page of a sale that accepts participation");
  await appPo.goToLaunchpad();
  await appPo.getLaunchpad2Po().getUpcomingLaunchesCardListPo().waitFor();
  const upcomingLaunchesCards = await appPo
    .getLaunchpad2Po()
    .getUpcomingLaunchesCardListPo()
    .getCardEntries();
  await upcomingLaunchesCards[0].click();

  await projectDetail.waitForContentLoaded();
  expect(await projectDetail.getStatus()).toBe("Accepting Participation");

  step("The page shows a participant count");
  await expect
    .poll(() => projectCommitmentPo.hasParticipantsCount(), {
      timeout: POLL_TIMEOUT,
    })
    .toBe(true);
  const countBeforeParticipation =
    await projectCommitmentPo.getParticipantsCount();
  expect(Number.isNaN(countBeforeParticipation)).toBe(false);

  step("The page requests no metrics from the raw domain");
  expect(rawMetricsRequests()).toEqual([]);

  step("Sign in and get some ICP to participate in the sale");
  await signInWithNewUser({ page, context });
  await appPo.goBack();
  await appPo.getIcpTokens(20);
  await upcomingLaunchesCards[0].click();
  await projectDetail.waitForContentLoaded();

  step("Participate in the sale");
  expect(await projectDetail.hasCommitmentAmount()).toBe(false);
  await projectDetail.participate({ amount: 5, acceptConditions: true });
  expect(await projectDetail.getCommitmentAmount()).toBe("5.00");

  step("The participant count rises by one, so it follows the swap state");
  await expect
    .poll(() => projectCommitmentPo.getParticipantsCount(), {
      timeout: POLL_TIMEOUT,
    })
    .toBe(countBeforeParticipation + 1);

  step("No request went to the raw metrics domain at any point");
  expect(rawMetricsRequests()).toEqual([]);
});
