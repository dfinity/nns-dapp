import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS governance", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My ICP Tokens / NNS Dapp");
  // TODO: GIX-1985 Remove this once the feature flag is enabled by default
  await setFeatureFlag({ page, featureFlag: "ENABLE_MY_TOKENS", value: true });
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Navigate to SNS universe");
  const snsUniverseRows = await appPo
    .getTokensPo()
    .getTokensPagePo()
    .getTokensTable()
    .getSnsRows();
  expect(snsUniverseRows.length).toBeGreaterThanOrEqual(1);
  const snsUniverseRow = snsUniverseRows[0];
  const snsProjectName = await snsUniverseRow.getProjectName();

  // Our test SNS project names are always 5 uppercase letters.
  expect(snsProjectName).toMatch(/[A-Z]{5}/);

  step("Acquire tokens");
  await appPo.getSnsTokens({ amount: 20, name: snsProjectName });

  expect(await snsUniverseRow.getBalanceNumber()).toEqual("20.00");

  step("Stake a neuron");
  await appPo.goToNeurons();

  await appPo.openUniverses();
  await appPo.getSelectUniverseListPo().clickOnSnsUniverse(snsProjectName);

  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  expect(
    await appPo.getNeuronsPo().getSnsNeuronsPo().getEmptyMessage()
  ).toEqual(
    `You have no ${snsProjectName} neurons. Stake a neuron to vote on proposals for ${snsProjectName}.`
  );

  const stake = 5;
  const formattedStake = "5.00";
  await appPo.getNeuronsPo().getSnsNeuronsFooterPo().stakeNeuron(stake);

  step("SN001: User can see the list of neurons");
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  const neuronCards = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronCardPos();
  expect(neuronCards.length).toBe(1);
  const neuronCard = neuronCards[0];
  expect(await neuronCard.getStake()).toEqual(formattedStake);

  step("SN002: User can see the details of a neuron");
  await neuronCard.click();
  const neuronDetail = appPo.getNeuronDetailPo().getSnsNeuronDetailPo();
  expect(await neuronDetail.getUniverse()).toBe(snsProjectName);
  expect(await neuronDetail.getStake()).toBe(formattedStake);
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);

  step("SN003: User can add a hotkey");
  const hotkeyPrincipal =
    "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";
  await neuronDetail.addHotkey(hotkeyPrincipal);

  step("SN005: User can see the list of hotkeys of a neuron");
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

  step("SN004: User can remove a hotkey");
  await neuronDetail.removeHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);
});
