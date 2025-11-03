import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import {
  mockNamedAddress,
  mockNamedAddressIcrc1,
} from "$tests/mocks/address-book.mock";
import { AppPo } from "$tests/page-objects/App.page-object";
import { PlaywrightPageObjectElement } from "$tests/page-objects/playwright.page-object";
import {
  disableCssAnimations,
  signInWithNewUser,
  step,
} from "$tests/utils/e2e.test-utils";
import { expect, test } from "@playwright/test";

// @TODO: Enable this test once the address book feature flag is enabled
test.skip("Test address book functionality", async ({ page, context }) => {
  await page.goto("/address-book");
  await disableCssAnimations(page);
  await expect(page).toHaveTitle("Address Book | Network Nervous System");

  await signInWithNewUser({ page, context });

  const pageElement = PlaywrightPageObjectElement.fromPage(page);
  const appPo = new AppPo(pageElement);

  const addressBookPo = appPo.getAddressBookPo();

  step("Address book starts with empty state");
  await addressBookPo.waitForContentLoaded();
  expect(await addressBookPo.hasEmptyState()).toBe(true);

  step("Click on 'add address' button, modal shows up");
  await addressBookPo.clickAddAddress();
  const addAddressModalPo = appPo.getAddAddressModalPo();
  await addAddressModalPo.waitFor();

  step("Modal is empty");
  expect(await addAddressModalPo.getNicknameInputPo().getValue()).toBe("");
  expect(await addAddressModalPo.getAddressInputPo().getValue()).toBe("");

  step("Enter valid ICP label and address");
  const icpAddress = (mockNamedAddress.address as { Icp: string }).Icp;
  await addAddressModalPo.addAddress("Alice ICP", icpAddress);

  step("Wait for save to complete and check success toast");
  await addAddressModalPo.waitForClosed();
  const toastsPo = appPo.getToastsPo();
  const toastMessages = await toastsPo.getMessages();
  expect(
    toastMessages.some((msg) => msg.includes("Address saved successfully."))
  ).toBe(true);
  await toastsPo.closeAll();

  step("State is not empty anymore, table shows with correct data");
  expect(await addressBookPo.hasEmptyState()).toBe(false);
  const tablePo = addressBookPo.getResponsiveTablePo();
  await tablePo.waitFor();

  const rowsData = await addressBookPo.getTableRowsData();
  expect(rowsData).toHaveLength(1);
  expect(rowsData[0].nickname).toBe("Alice ICP");
  expect(rowsData[0].address).toBe(shortenWithMiddleEllipsis(icpAddress));

  step("Click add address button again");
  await addressBookPo.clickAddAddress();
  await addAddressModalPo.waitFor();

  step("Modal reopens empty");
  expect(await addAddressModalPo.getNicknameInputPo().getValue()).toBe("");
  expect(await addAddressModalPo.getAddressInputPo().getValue()).toBe("");
  step("Add new valid ICRC1 name and address");
  const icrc1Address = (mockNamedAddressIcrc1.address as { Icrc1: string })
    .Icrc1;
  await addAddressModalPo.addAddress("Bob ICRC1", icrc1Address);

  step("Wait for call to finish and verify it's added to table");
  await addAddressModalPo.waitForClosed();
  const toastMessages2 = await toastsPo.getMessages();
  expect(
    toastMessages2.some((msg) => msg.includes("Address saved successfully."))
  ).toBe(true);
  await toastsPo.closeAll();

  const rowsData2 = await addressBookPo.getTableRowsData();
  expect(rowsData2).toHaveLength(2);

  expect(rowsData2[0].nickname).toBe("Alice ICP");
  expect(rowsData2[0].address).toBe(shortenWithMiddleEllipsis(icpAddress));
  expect(rowsData2[1].nickname).toBe("Bob ICRC1");
  expect(rowsData2[1].address).toBe(shortenWithMiddleEllipsis(icrc1Address));

  step("Edit Alice ICP nickname to Marta ICP");
  await addressBookPo.clickEditOnRow("Alice ICP");
  await addAddressModalPo.waitFor();

  step("Modal should be prefilled with Alice's data");
  expect(await addAddressModalPo.getNicknameInputPo().getValue()).toBe(
    "Alice ICP"
  );
  expect(await addAddressModalPo.getAddressInputPo().getValue()).toBe(
    icpAddress
  );

  step("Update nickname to Marta ICP");
  await addAddressModalPo.updateAddress("Marta ICP", icpAddress);

  step("Wait for update to complete and check success toast");
  await addAddressModalPo.waitForClosed();
  const toastMessages3 = await toastsPo.getMessages();
  expect(
    toastMessages3.some((msg) => msg.includes("Address updated successfully."))
  ).toBe(true);
  await toastsPo.closeAll();

  step("Verify nickname has changed in the table");
  const rowsData3 = await addressBookPo.getTableRowsData();
  expect(rowsData3).toHaveLength(2);
  expect(rowsData3[0].nickname).toBe("Bob ICRC1");
  expect(rowsData3[0].address).toBe(shortenWithMiddleEllipsis(icrc1Address));
  expect(rowsData3[1].nickname).toBe("Marta ICP");
  expect(rowsData3[1].address).toBe(shortenWithMiddleEllipsis(icpAddress));

  step("Edit Marta ICP address");
  await addressBookPo.clickEditOnRow("Marta ICP");
  await addAddressModalPo.waitFor();

  step("Update address to ICRC1 address");
  await addAddressModalPo.updateAddress("Marta ICP", icrc1Address);

  step("Wait for update to complete and verify address changed");
  await addAddressModalPo.waitForClosed();
  const toastMessages4 = await toastsPo.getMessages();
  expect(
    toastMessages4.some((msg) => msg.includes("Address updated successfully."))
  ).toBe(true);
  await toastsPo.closeAll();

  const rowsData4 = await addressBookPo.getTableRowsData();
  expect(rowsData4).toHaveLength(2);
  expect(rowsData4[0].nickname).toBe("Bob ICRC1");
  expect(rowsData4[0].address).toBe(shortenWithMiddleEllipsis(icrc1Address));
  expect(rowsData4[1].nickname).toBe("Marta ICP");
  expect(rowsData4[1].address).toBe(shortenWithMiddleEllipsis(icrc1Address));
});
