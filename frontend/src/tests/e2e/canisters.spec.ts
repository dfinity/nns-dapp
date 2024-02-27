import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import { signInWithNewUser, step } from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test canisters", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("My Tokens / NNS Dapp");
  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  step("Get some ICP");
  await appPo.getIcpTokens(10);

  step("Create a canister");
  const canisterName = "MyCanister";
  await appPo.goToCanisters();
  const canistersPo = appPo.getCanistersPo();
  await canistersPo.createCanister({
    name: canisterName,
    icpAmount: "1",
  });

  step("Rename canister");
  const canisterCards = await canistersPo.getCanisterCardPos();
  expect(canisterCards).toHaveLength(1);
  const canisterCard = canisterCards[0];
  expect(await canisterCard.getCanisterName()).toBe(canisterName);
  await canisterCard.click();

  const newCanisterName = "MyCanister2";
  const canisterDetail = appPo.getCanisterDetailPo();
  await canisterDetail.clickRename();
  await canisterDetail.renameCanister(newCanisterName);

  step("Top up canister");
  await canisterDetail.addCycles({ icpAmount: "2" });

  step("Verify name");
  await appPo.goBack();
  expect(await canisterCard.getCanisterName()).toBe(newCanisterName);

  step("Check transaction descriptions");
  await appPo.goToNnsMainAccountWallet();
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getTransactionListPo();
  await transactionList.waitForLoaded();
  const transactions = await transactionList.getTransactionCardPos();
  expect(await Promise.all(transactions.map((tx) => tx.getHeadline()))).toEqual(
    ["Top-up Canister", "Create Canister", "Received"]
  );
  expect(await Promise.all(transactions.map((tx) => tx.getAmount()))).toEqual([
    "-2.0001",
    "-1.0001",
    "+10.00",
  ]);
});
