import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test neuron following", async ({ page, context }) => {
  await page.goto("/");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(20);

  step("Stake first neuron");
  await appPo.goToStaking();

  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 1, dissolveDelayDays: "max" });

  const neurons = await appPo.getNeuronsPo().getNnsNeuronsPo().getNeuronIds();

  expect(neurons.length).toBe(1);

  step("Stake neuron");
  await appPo.getNeuronsPo().getNnsNeuronsFooterPo().clickStakeNeuronsButton();

  const stakeModal = appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .getNnsStakeNeuronModalPo();

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

  const followee = neurons[0];
  for (const followNnsTopicSection of followNnsTopicSections) {
    await followNnsTopicSection.addFollowee(followee);
    const followees = await followNnsTopicSection.getFollowees();
    expect(followees).toContain(followee);
  }
});
