import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS governance", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Network Nervous System frontend dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  const snsUniverseCards = await appPo
    .getSelectUniverseListPo()
    .getSnsUniverseCards();
  expect(snsUniverseCards.length).toBeGreaterThanOrEqual(1);
  const snsUniverseCard = snsUniverseCards[0];
  const snsProjectName = await snsUniverseCard.getName();

  // Our test SNS project names are always 5 uppercase letters.
  expect(snsProjectName).toMatch(/[A-Z]{5}/);

  await snsUniverseCard.click();
  await appPo.getTokens(20);

  expect(
    await appPo
      .getAccountsPo()
      .getSnsAccountsPo()
      .getMainAccountCardPo()
      .getBalance()
  ).toEqual("20.00");

  await appPo.goToNeurons();
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  expect(
    await appPo.getNeuronsPo().getSnsNeuronsPo().getEmptyMessage()
  ).toEqual(
    `You have no ${snsProjectName} neurons. Stake a neuron to vote on proposals for ${snsProjectName}.`
  );

  const stake = 5;
  const formattedStake = "5.00";
  await appPo.getNeuronsPo().getSnsNeuronsFooterPo().stakeNeuron(stake);

  // SN001: User can see the list of neurons
  const neuronCards = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronCardPos();
  expect(neuronCards.length).toBe(1);
  const neuronCard = neuronCards[0];
  expect(await neuronCard.getStake()).toEqual(formattedStake);

  // SN002: User can see the details of a neuron
  await neuronCard.click();
  const neuronDetail = appPo.getNeuronDetailPo().getSnsNeuronDetailPo();
  expect(await neuronDetail.getTitle()).toBe(snsProjectName);
  expect(await neuronDetail.getStake()).toBe(formattedStake);

  // SN003: User can add a hotkey

  // SN004: User can remove a hotkey

  // SN005: User can see the list of hotkeys of a neuron
});
