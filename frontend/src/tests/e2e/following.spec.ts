import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron following", async ({ page, context }) => {
  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });
  await page.goto("/");
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(20);

  step("Stake neuron");
  await appPo.goToStaking();
  const nnsRow = await appPo
    .getStakingPo()
    .getProjectsTablePo()
    .getRowByTitle("Internet Computer");
  await nnsRow.getStakeButtonPo().click();
  const stakeModal = appPo.getStakingPo().getNnsStakeNeuronModalPo();
  await stakeModal.getNnsStakeNeuronPo().stake(10);
  await stakeModal.getSetDissolveDelayPo().setDissolveDelayDays("max");
  await stakeModal.getConfirmDissolveDelayPo().clickConfirm();
  await stakeModal.getEditFollowNeuronsPo().waitFor();
  const followNnsTopicSections = await stakeModal
    .getEditFollowNeuronsPo()
    .getFollowNnsTopicSectionPos();

  step("Follow topics");
  expect(followNnsTopicSections.length).toBe(17);
  // Go through sections in reverse order because the later ones are the ones
  // most likely to fail.
  followNnsTopicSections.reverse();
  const followee = "123";
  for (const followNnsTopicSection of followNnsTopicSections) {
    const followTopicSection =
      await followNnsTopicSection.getFollowTopicSectionPo();
    await followTopicSection.getCollapsiblePo().expand();
    await followTopicSection.getAddFolloweeButtonPo().click();
    await followNnsTopicSection
      .getNewFolloweeModalPo()
      .followNeuronId(followee);
    const followees = await followNnsTopicSection.getFollowees();
    expect(followees).toContain(followee);
  }
});
