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

  step("Stake neuron with full flow");
  await appPo.getNeuronsPo().getNnsNeuronsFooterPo().clickStakeNeuronsButton();

  const stakeModal = appPo
    .getNeuronsPo()
    .getNnsNeuronsFooterPo()
    .getNnsStakeNeuronModalPo();
  await stakeModal.getNnsStakeNeuronPo().stake(10);

  await stakeModal.getSetDissolveDelayPo().setDissolveDelayDays("max");
  await stakeModal.getConfirmDissolveDelayPo().clickConfirm();
  await stakeModal.getFollowNnsNeuronsByTopicStepTopicsPo().waitFor();
  const followNnsByTopicStepTopic =
    stakeModal.getFollowNnsNeuronsByTopicStepTopicsPo();

  step("Follow topics");
  const topics = await followNnsByTopicStepTopic.getTopicItemPos();
  expect(topics.length).toBe(17);

  // Select one topic to follow and click continue
  await followNnsByTopicStepTopic.clickTopicItemByName("Governance");
  await followNnsByTopicStepTopic.clickNextButton();

  // Set the followee neuron
  await stakeModal.getFollowNnsNeuronsByTopicStepNeuronPo().waitFor();
  const followNnsByTopicStepNeuron =
    stakeModal.getFollowNnsNeuronsByTopicStepNeuronPo();

  const followee = neurons[0];
  followNnsByTopicStepNeuron.typeNeuronAddress(followee);
  followNnsByTopicStepNeuron.clickFollowNeuronButton();

  await stakeModal.getFollowNnsNeuronsByTopicStepTopicsPo().waitFor();
  const governanceTopic =
    await followNnsByTopicStepTopic.getTopicItemPoByName("Governance");
  expect(await governanceTopic.getFolloweesNeuronIds()).toContain(followee);
});
