import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  setFeatureFlag,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

test("Test canisters", async ({ page, context }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.*\s\/\sNNS Dapp/);

  await setFeatureFlag({
    page,
    featureFlag: "ENABLE_PORTFOLIO_PAGE",
    value: true,
  });

  await page.reload();
  await expect(page).toHaveTitle("Portfolio / NNS Dapp");
  await signInWithNewUser({ page, context });

  await page.goto("/tokens");
  await expect(page).toHaveTitle("Tokens / NNS Dapp");

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

  expect(await appPo.getToastsPo().getMessages()).toEqual([
    `New canister "${canisterName}" created successfully`,
  ]);
  await appPo.getToastsPo().closeAll();

  step("Link a non-controlled canister");
  const linkedCanisterId = "qsgjb-riaaa-aaaaa-aaaga-cai";
  const linkedCanisterName = "NNS dapp";
  await canistersPo.linkCanister({
    canisterId: linkedCanisterId,
    name: linkedCanisterName,
  });

  expect(await appPo.getToastsPo().getMessages()).toEqual([
    `The canister (${linkedCanisterId}) was linked successfully`,
  ]);
  await appPo.getToastsPo().closeAll();

  step("Rename canister");
  const canisterCards = await canistersPo.getCanisterCardPos();
  expect(canisterCards).toHaveLength(2);
  let [myCanisterCard, linkedCanisterCard] = canisterCards;
  expect(await myCanisterCard.getCanisterName()).toBe(canisterName);
  expect(await linkedCanisterCard.getCanisterName()).toBe(linkedCanisterName);
  await myCanisterCard.click();

  await appPo.getCanisterDetailPo().waitFor();

  /*
  const newCanisterName = "MyCanister2";
  const canisterDetail = appPo.getCanisterDetailPo();
  await canisterDetail.clickRename();
  await canisterDetail.renameCanister(newCanisterName);

  expect(await appPo.getToastsPo().getMessages()).toEqual([
    `Canister successfully renamed to "${newCanisterName}"`,
  ]);
  await appPo.getToastsPo().closeAll();

  step("Top up canister");
  await canisterDetail.addCycles({ icpAmount: "2" });

  expect(await appPo.getToastsPo().getMessages()).toEqual([
    "Cycles added successfully",
  ]);
  await appPo.getToastsPo().closeAll();
//*/

  step("Verify name");
  await appPo.goBack();
  await canistersPo.waitForContentLoaded();
  [myCanisterCard, linkedCanisterCard] = await canistersPo.getCanisterCardPos();
  //expect(await myCanisterCard.getCanisterName()).toBe(newCanisterName);

  step("Open linked canister");
  await linkedCanisterCard.click();
  expect(await appPo.getCanisterDetailPo().getErrorMessage()).toBe(
    "You are not the controller of this canister. Only controllers have access to its cycles and controllers."
  );
  expect(await appPo.getToastsPo().getMessages()).toEqual([]);

  await new Promise((r) => setTimeout(r, 2000));

  return;

  step("Check transaction descriptions");
  await appPo.goToNnsMainAccountWallet();
  const transactionList = appPo
    .getWalletPo()
    .getNnsWalletPo()
    .getUiTransactionsListPo();
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
