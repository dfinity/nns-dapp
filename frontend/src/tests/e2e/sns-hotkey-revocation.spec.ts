import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";

// This spec proves that the removal of an SNS hotkey revokes every voting
// permission. The old code revoked only `Vote` and `SubmitProposal`. A hotkey
// that also held `ManageVotingPermission` kept that permission, vanished from
// the hotkey list, and could grant the other permissions back to itself.
//
// The spec is `test.fixme`, so Playwright skips it in CI. Nobody has run it
// yet, because the local dfx replica is broken. A human must run it once, fix
// what the first run shows, and then remove the `fixme`.
//
// Four things are still unproven.
//
// 1. The test SNS must allow `ManageVotingPermission` in
//    `neuron_grantable_permissions`. If it does not, the governance canister
//    rejects the grant in "Grant ManageVotingPermission to the hotkey".
// 2. `grantPermissions` clicks the checkbox input of the TESTNET modal by its
//    id. A label may cover that input.
// 3. `permissionsOf` reads the TESTNET permissions card through an XPath
//    sibling, because that card has no test id of its own.
// 4. The toast assertions read the toast list once. A toast from an earlier
//    step may still be on screen.

// The numbers are the values of `SnsNeuronPermissionType`.
const SUBMIT_PROPOSAL = 3;
const VOTE = 4;
const MANAGE_VOTING_PERMISSION = 10;
const ALL_PERMISSIONS = [
  0,
  1,
  2,
  SUBMIT_PROPOSAL,
  VOTE,
  5,
  6,
  7,
  8,
  9,
  MANAGE_VOTING_PERMISSION,
];

// The permissions card shows a principal through `Hash`, which shortens the
// text. `shortenWithMiddleEllipsis` keeps 7 characters on each side.
const shorten = (principal: string): string =>
  `${principal.slice(0, 7)}...${principal.slice(-7)}`;

// Reads the TESTNET permissions card, which lists every permission entry of
// the neuron. The hotkey card cannot prove a revocation on its own: the bug
// was that a principal with a residual permission disappeared from it.
const permissionsOf = async ({
  page,
  principal,
}: {
  page: Page;
  principal: string;
}): Promise<string[]> => {
  const title = page
    .locator('[data-tid="hash-component"]')
    .filter({ hasText: shorten(principal) });
  if ((await title.count()) === 0) {
    return [];
  }
  return title
    .first()
    .locator("xpath=following-sibling::ul[1]")
    .locator("li")
    .allTextContents();
};

// Grants permissions with the TESTNET permissions card. The dapp has no other
// way to create a principal with `ManageVotingPermission`.
const grantPermissions = async ({
  page,
  principal,
  permissions,
}: {
  page: Page;
  principal: string;
  permissions: number[];
}): Promise<void> => {
  await page.getByRole("button", { name: "Add Permissions" }).click();

  const form = page.getByTestId("add-principal-component");
  await form.locator('input[name="principal"]').fill(principal);
  await form.getByTestId("add-principal-button").click();

  // The modal checks every permission by default.
  for (const permission of ALL_PERMISSIONS) {
    if (!permissions.includes(permission)) {
      await page.locator(`input[id="${permission}"]`).click();
    }
  }

  await page.getByRole("button", { name: "Confirm" }).click();
};

test.fixme("Test SNS hotkey revocation", async ({ page, context }) => {
  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Acquire tokens");
  // "Alfa Centauri" is the test SNS project configured with a faucet.
  const snsProjectName = "Alfa Centauri";
  await appPo.getSnsTokens({ amount: 20, name: snsProjectName });

  step("Stake a neuron");
  await appPo.goToStaking();
  await appPo.getStakingPo().stakeFirstSnsNeuron({
    projectName: snsProjectName,
    amount: 5,
  });

  step("Open the neuron detail page");
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  const neuronRows = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronsTablePo()
    .getNeuronsTableRowPos();
  expect(neuronRows).toHaveLength(1);
  await neuronRows[0].click();

  const neuronDetail = appPo.getNeuronDetailPo().getSnsNeuronDetailPo();
  expect(await neuronDetail.getUniverse()).toBe(snsProjectName);
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);

  const hotkeyPrincipal =
    "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";

  step("Add a hotkey");
  await neuronDetail.addHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

  step("Grant ManageVotingPermission to the hotkey");
  await grantPermissions({
    page,
    principal: hotkeyPrincipal,
    permissions: [MANAGE_VOTING_PERMISSION],
  });
  await appPo.waitForNotBusy();

  // This is the permission set of a Community Fund hotkey.
  expect(await permissionsOf({ page, principal: hotkeyPrincipal })).toEqual(
    expect.arrayContaining([
      "NEURON_PERMISSION_TYPE_VOTE",
      "NEURON_PERMISSION_TYPE_SUBMIT_PROPOSAL",
      "NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION",
    ])
  );
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

  step("Remove the hotkey");
  await neuronDetail.removeHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();

  step("The removed hotkey keeps no permission");
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);
  // The old code left `NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION` here.
  expect(await permissionsOf({ page, principal: hotkeyPrincipal })).toEqual([]);
  // The success is real, so the card shows no error.
  expect(await appPo.getToastsPo().getMessages()).toEqual([]);

  const partialPrincipal =
    "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae";

  step("Grant only Vote to a second principal");
  await grantPermissions({
    page,
    principal: partialPrincipal,
    permissions: [VOTE],
  });
  await appPo.waitForNotBusy();

  step("The card shows the principal with a warning");
  // The principal holds a partial hotkey permission set. It keeps power over
  // the neuron, so the card must not hide it.
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([partialPrincipal]);
  expect(await page.getByTestId("partial-hotkey-warning").count()).toBe(1);

  step("The user can remove the partial hotkey");
  await neuronDetail.removeHotkey(partialPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);
  expect(await permissionsOf({ page, principal: partialPrincipal })).toEqual(
    []
  );
  expect(await appPo.getToastsPo().getMessages()).toEqual([]);
});
