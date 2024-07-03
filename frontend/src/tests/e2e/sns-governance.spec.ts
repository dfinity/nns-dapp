import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test SNS governance", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");
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
  const askedAmount = 20;
  await appPo.getSnsTokens({ amount: askedAmount, name: snsProjectName });

  expect(await snsUniverseRow.getBalanceNumber()).toEqual(askedAmount);

  step("Stake a neuron");
  await appPo.goToNeurons();

  await appPo.openUniverses();
  await appPo.getSelectUniverseListPo().clickOnUniverse(snsProjectName);

  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  expect(
    await appPo.getNeuronsPo().getSnsNeuronsPo().getEmptyMessage()
  ).toEqual(
    `You have no ${snsProjectName} neurons. Create a neuron by staking ${snsProjectName} to vote on ${snsProjectName} proposals.`
  );

  const stake = 5;
  const formattedStake = "5.00";
  await appPo.getNeuronsPo().getSnsNeuronsFooterPo().stakeNeuron(stake);

  step("SN001: User can see the list of neurons");
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  const neuronRows = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronsTablePo()
    .getNeuronsTableRowPos();
  expect(neuronRows).toHaveLength(1);
  const neuronRow = neuronRows[0];
  expect(await neuronRow.getStakeBalance()).toEqual(formattedStake);

  step("SN002: User can see the details of a neuron");
  await neuronRow.click();
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
