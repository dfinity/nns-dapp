import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { Principal } from "@icp-sdk/core/principal";
import { expect, test } from "@playwright/test";

test("Test hotkeys", async ({ page, context }) => {
  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const appPo = new AppPo(PlaywrightPageObjectElement.fromPage(page));
  const oldHotkey =
    "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";
  const newHotkey = Principal.fromUint8Array(
    Uint8Array.from([1, 2, 3, 4, 5])
  ).toText();
  // "Alfa Centauri" is the test SNS project configured with a faucet.
  const snsProjectName = "Alfa Centauri";

  step("Get some tokens");
  await appPo.getIcpTokens(11);
  await appPo.getSnsTokens({ amount: 20, name: snsProjectName });

  step("Stake an NNS neuron with a hotkey");
  await appPo.goToStaking();
  await appPo
    .getStakingPo()
    .stakeFirstNnsNeuron({ amount: 10, dissolveDelayDays: "max" });
  const nnsNeuronIds = await appPo
    .getNeuronsPo()
    .getNnsNeuronsPo()
    .getNeuronIds();
  expect(nnsNeuronIds).toHaveLength(1);
  await appPo.goToNeuronDetails(nnsNeuronIds[0]);
  await appPo.getNeuronDetailPo().getNnsNeuronDetailPo().addHotkey(oldHotkey);

  step("Stake an SNS neuron with the same hotkey");
  await appPo.goToStaking();
  await appPo.getStakingPo().stakeFirstSnsNeuron({
    projectName: snsProjectName,
    amount: 5,
  });
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  const snsNeuronRows = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronsTablePo()
    .getNeuronsTableRowPos();
  expect(snsNeuronRows).toHaveLength(1);
  await snsNeuronRows[0].click();
  const snsNeuronDetail = appPo.getNeuronDetailPo().getSnsNeuronDetailPo();
  await snsNeuronDetail.addHotkey(oldHotkey);
  expect(await snsNeuronDetail.getHotkeyPrincipals()).toEqual([oldHotkey]);

  step("See the hotkey of both neurons");
  await appPo.goToHotkeys();
  const hotkeysPo = appPo.getHotkeysPo();
  // A row that leaves with a transition has no tooltip, so a read can fail
  // until the transition ends.
  const getRowsData = () => hotkeysPo.getRowsData().catch(() => undefined);
  const areActionsDisabled = () =>
    hotkeysPo.areActionsDisabled(0).catch(() => undefined);
  await expect.poll(getRowsData).toEqual([
    {
      principal: oldHotkey,
      projects: ["Internet Computer: 1", `${snsProjectName}: 1`],
      neuronCount: "2",
    },
  ]);

  step("Replace the hotkey on both neurons");
  await expect.poll(areActionsDisabled).toEqual([false, false]);
  await hotkeysPo.clickReplace(0);
  const modalPo = appPo.getChangeHotkeyModalPo();
  await modalPo.typeNewHotkey(newHotkey);
  await modalPo.clickConfirm();
  expect(await modalPo.getResultSuccessText()).toBe(
    "The hotkey changed on all 2 neurons."
  );
  await modalPo.clickClose();
  await expect
    .poll(async () => (await getRowsData())?.map(({ principal }) => principal))
    .toEqual([newHotkey]);

  step("Remove the hotkey from both neurons");
  await expect.poll(areActionsDisabled).toEqual([false, false]);
  await hotkeysPo.clickRemove(0);
  await modalPo.clickConfirm();
  expect(await modalPo.getResultSuccessText()).toBe(
    "The hotkey changed on all 2 neurons."
  );
  await modalPo.clickClose();
  await expect.poll(() => hotkeysPo.hasEmptyState()).toBe(true);
});
