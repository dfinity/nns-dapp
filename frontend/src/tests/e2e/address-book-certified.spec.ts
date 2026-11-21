import { mockNamedAddressIcp } from "$tests/mocks/address-book.mock";
import type { AddAddressModalPo } from "$tests/page-objects/AddAddressModal.page-object";
import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import type { ToastsPo } from "$tests/page-objects/Toasts.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

// A save replaces the whole address book. It must build the replacement from
// certified entries only. The store keeps a `certified` flag: the query
// response sets it to false, and the update response sets it to true.
//
// This test holds back the update response of the nns-dapp canister. The store
// then keeps the query response. The save must still go through, and it must
// still write certified data.
const UPDATE_CALL_DELAY_MS = 10_000;

// `./config.sh` writes the nns-dapp canister id into `frontend/.env`.
// `dfx canister id` is not usable here, because a git worktree holds no
// `.dfx/local/canister_ids.json`.
const nnsDappCanisterIdFromEnv = (): string => {
  const env = readFileSync(resolve(process.cwd(), ".env"), "utf8");
  const match = env.match(/^VITE_OWN_CANISTER_ID=(.*)$/m);
  if (match === null) {
    throw new Error("VITE_OWN_CANISTER_ID is missing from frontend/.env");
  }
  return match[1].trim();
};

// Hold back every update call to the nns-dapp canister. Query calls stay fast.
const delayUpdateCalls = ({
  page,
  canisterId,
}: {
  page: Page;
  canisterId: string;
}): Promise<void> =>
  page.route(`**/canister/${canisterId}/call`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, UPDATE_CALL_DELAY_MS));
    await route.continue();
  });

// The modal closes only after the save goes through. A blocked save keeps the
// modal open and shows an error toast. Report that toast, so a failure says
// what the user saw.
const waitForSave = async ({
  addAddressModalPo,
  toastsPo,
  timeoutMs,
}: {
  addAddressModalPo: AddAddressModalPo;
  toastsPo: ToastsPo;
  timeoutMs: number;
}): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (!(await addAddressModalPo.isPresent())) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const messages = await toastsPo.getMessages();
  throw new Error(
    `The save did not go through. The modal is still open. Toasts: ${JSON.stringify(messages)}`
  );
};

test("Address book saves build on certified data", async ({
  page,
  context,
}) => {
  const nnsDappCanisterId = nnsDappCanisterIdFromEnv();
  const icpAddress = (mockNamedAddressIcp.address as { Icp: string }).Icp;

  await page.goto("/address-book");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Address Book | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);
  const addressBookPo = appPo.getAddressBookPo();
  const addAddressModalPo = appPo.getAddAddressModalPo();
  const toastsPo = appPo.getToastsPo();

  step("A new user adds the first entry");
  await addressBookPo.waitForContentLoaded();
  await addressBookPo.clickAddAddress();
  await addAddressModalPo.waitFor();
  await addAddressModalPo.addAddress("Alice", icpAddress);

  step("The save goes through and the modal closes");
  await waitForSave({ addAddressModalPo, toastsPo, timeoutMs: 30_000 });

  const rowsAfterAdd = await addressBookPo.getTableRowsData();
  expect(rowsAfterAdd).toHaveLength(1);
  expect(rowsAfterAdd[0].nickname).toBe("Alice");

  step("Hold back the update call, then reload the page");
  await delayUpdateCalls({ page, canisterId: nnsDappCanisterId });
  await page.reload();
  await disableCssAnimations(page);

  step("The table renders the query response, so the store is uncertified");
  await addressBookPo.waitForContentLoaded();
  const rowsAfterReload = await addressBookPo.getTableRowsData();
  expect(rowsAfterReload).toHaveLength(1);
  expect(rowsAfterReload[0].nickname).toBe("Alice");

  step("Add a second entry while the store holds the query response");
  await addressBookPo.clickAddAddress();
  await addAddressModalPo.waitFor();
  await addAddressModalPo.addAddress("Bob", icpAddress);

  step("The save is slower, but it still goes through and shows no error");
  await waitForSave({ addAddressModalPo, toastsPo, timeoutMs: 90_000 });

  step("Let the update calls through again and reload");
  await page.unroute(`**/canister/${nnsDappCanisterId}/call`);
  await page.reload();
  await disableCssAnimations(page);
  await addressBookPo.waitForContentLoaded();

  step("The stored address book holds both entries");
  const finalRows = await addressBookPo.getTableRowsData();
  expect(finalRows.map((row) => row.nickname).sort()).toEqual(["Alice", "Bob"]);
});
