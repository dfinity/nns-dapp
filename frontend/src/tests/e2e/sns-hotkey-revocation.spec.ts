import { AppPo } from "$tests/page-objects/App.page-object";
import type { SnsNeuronDetailPo } from "$tests/page-objects/SnsNeuronDetail.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// Copied from `en.json`. Playwright cannot import the JSON file.
const REMOVE_INCOMPLETE_ERROR =
  "The hotkey keeps some permissions on the neuron. Try again to remove them.";
const NEURON_NOT_FOUND_ERROR = "Neuron not found.";

// This spec proves that the removal of an SNS hotkey revokes every voting
// permission. A hotkey that also holds `ManageVotingPermission` must lose that
// permission too. Otherwise it vanishes from the hotkey list and can grant the
// other permissions back to itself.
//
// The second test proves that a failed certified reload after the removal
// shows one error, not a second "incomplete" error.

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

// "Alfa Centauri" is the test SNS project configured with a faucet.
const SNS_PROJECT_NAME = "Alfa Centauri";

// Signs in a new user, stakes an SNS neuron and opens its detail page.
const openNewSnsNeuron = async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}): Promise<{ appPo: AppPo; neuronDetail: SnsNeuronDetailPo }> => {
  await page.goto("/tokens");
  await disableCssAnimations(page);
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  await step("Acquire tokens");
  await appPo.getSnsTokens({ amount: 20, name: SNS_PROJECT_NAME });

  await step("Stake a neuron");
  await appPo.goToStaking();
  await appPo.getStakingPo().stakeFirstSnsNeuron({
    projectName: SNS_PROJECT_NAME,
    amount: 5,
  });

  await step("Open the neuron detail page");
  await appPo.getNeuronsPo().getSnsNeuronsPo().waitForContentLoaded();
  const neuronRows = await appPo
    .getNeuronsPo()
    .getSnsNeuronsPo()
    .getNeuronsTablePo()
    .getNeuronsTableRowPos();
  expect(neuronRows).toHaveLength(1);
  await neuronRows[0].click();

  const neuronDetail = appPo.getNeuronDetailPo().getSnsNeuronDetailPo();
  expect(await neuronDetail.getUniverse()).toBe(SNS_PROJECT_NAME);
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);

  return { appPo, neuronDetail };
};

test("Test SNS hotkey revocation", async ({ page, context }) => {
  const { appPo, neuronDetail } = await openNewSnsNeuron({ page, context });

  const hotkeyPrincipal =
    "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";

  await step("Add a hotkey");
  await neuronDetail.addHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

  await step("Grant ManageVotingPermission to the hotkey");
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

  await step("Remove the hotkey");
  await neuronDetail.removeHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();

  await step("The removed hotkey keeps no permission");
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);
  // The old code left `NEURON_PERMISSION_TYPE_MANAGE_VOTING_PERMISSION` here.
  expect(await permissionsOf({ page, principal: hotkeyPrincipal })).toEqual([]);
  // The success is real, so the card shows no error.
  expect(await appPo.getToastsPo().getMessages()).not.toContain(
    REMOVE_INCOMPLETE_ERROR
  );

  const partialPrincipal =
    "ucmt2-grxhb-qutyd-sp76m-amcvp-3h6sr-lqnoj-fik7c-bbcc3-irpdn-oae";

  await step("Grant only Vote to a second principal");
  await grantPermissions({
    page,
    principal: partialPrincipal,
    permissions: [VOTE],
  });
  await appPo.waitForNotBusy();

  await step("The card shows the principal with a warning");
  // The principal holds a partial hotkey permission set. It keeps power over
  // the neuron, so the card must not hide it.
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([partialPrincipal]);
  expect(await page.getByTestId("partial-hotkey-warning").count()).toBe(1);

  await step("The warning stays visible on a narrow screen");
  const viewport = page.viewportSize();
  await page.setViewportSize({ width: 375, height: 720 });
  await page.getByTestId("partial-hotkey-warning").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("partial-hotkey-warning")).toBeVisible();
  if (viewport !== null) {
    await page.setViewportSize(viewport);
  }

  await step("The user can remove the partial hotkey");
  await neuronDetail.removeHotkey(partialPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([]);
  expect(await permissionsOf({ page, principal: partialPrincipal })).toEqual(
    []
  );
  expect(await appPo.getToastsPo().getMessages()).not.toContain(
    REMOVE_INCOMPLETE_ERROR
  );
});

test("Test SNS hotkey removal with a failed certified reload", async ({
  page,
  context,
}) => {
  const { appPo, neuronDetail } = await openNewSnsNeuron({ page, context });

  const hotkeyPrincipal =
    "dskxv-lqp33-5g7ev-qesdj-fwwkb-3eze4-6tlur-42rxy-n4gag-6t4a3-tae";

  await step("Add a hotkey");
  await neuronDetail.addHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();
  expect(await neuronDetail.getHotkeyPrincipals()).toEqual([hotkeyPrincipal]);

  await step("Fail every certified get_neuron call");
  // The method name is a plain CBOR text string in the request body. The
  // removal itself is a `manage_neuron` call, so it still reaches the replica.
  let failedCalls = 0;
  await page.route(/\/api\/v\d+\/canister\/[^/]+\/call$/, async (route) => {
    const body = route.request().postDataBuffer()?.toString("latin1") ?? "";
    if (body.includes("get_neuron")) {
      failedCalls += 1;
      await route.fulfill({ status: 500, body: "e2e: certified call failed" });
      return;
    }
    await route.continue();
  });

  await step("Remove the hotkey");
  await neuronDetail.removeHotkey(hotkeyPrincipal);
  await appPo.waitForNotBusy();

  await step("The user sees one error");
  await expect
    .poll(() => appPo.getToastsPo().getMessages(), { timeout: 30_000 })
    .toContain(NEURON_NOT_FOUND_ERROR);
  expect(failedCalls).toBeGreaterThan(0);
  // The card does not read the stale neuron after the failed reload, so it
  // shows no second error.
  expect(await appPo.getToastsPo().getMessages()).not.toContain(
    REMOVE_INCOMPLETE_ERROR
  );
});
