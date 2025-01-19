import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

const SECONDS_IN_6_MONTHS = ((4 * 365 + 1) * (60 * 60 * 24)) / 4;

test("Test periodic confirmation", async ({ page, context }) => {
  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));

  await page.goto("/tokens");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");

  step("Sign in");
  await signInWithNewUser({ page, context });

  step("Get some tokens");
  await appPo.getIcpTokens(21);

  step("Stake a neuron");
  await appPo.goToStaking();
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 10, dissolveDelayDays: "max" });

  const neuronIds = await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();
  const neuronDetail = appPo.getNeuronDetailPo().getNnsNeuronDetailPo();
  await appPo.goToNeuronDetails(neuronIds[0]);

  step("Make the neuron inactive");
  await neuronDetail.updateVotingPowerRefreshedTimestamp(
    Math.round(Date.now() / 1000 - SECONDS_IN_6_MONTHS)
  );

  step("Review missing rewards banner");
  await appPo.goToStaking();
  const losingRewardsBannerPo = appPo.getStakingPo().getLosingRewardsBannerPo();
  expect(await losingRewardsBannerPo.isVisible()).toBe(true);

  step("Confirm following");
  await losingRewardsBannerPo.clickConfirm();
  // Review the modal
  const losingRewardNeuronsModalPo = appPo
    .getStakingPo()
    .getLosingRewardsBannerPo()
    .getLosingRewardNeuronsModalPo();
  const cards =
    await losingRewardNeuronsModalPo.getNnsLosingRewardsNeuronCardPos();
  expect(cards.length).toBe(1);
  expect(await cards[0].getNeuronId()).toEqual(neuronIds[0]);

  // Confirm
  await losingRewardNeuronsModalPo.clickConfirmFollowing();
  await appPo
    .getStakingPo()
    .getLosingRewardsBannerPo()
    .getBannerPo()
    .waitForAbsent();
  expect(await losingRewardsBannerPo.isVisible()).toBe(false);
});
