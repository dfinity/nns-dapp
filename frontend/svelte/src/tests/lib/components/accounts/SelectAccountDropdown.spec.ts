/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from "@testing-library/svelte";
import SelectAccountDropdown from "../../../../lib/components/accounts/SelectAccountDropdown.svelte";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";

describe("SelectAccountDropdown", () => {
  const mockSubAccount2 = {
    ...mockSubAccount,
    identifier: "test-identifier",
  };
  const subaccounts = [mockSubAccount, mockSubAccount2];
  const hardwareWallets = [mockHardwareWalletAccount];

  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe(subaccounts, hardwareWallets)
    );

  it("should render accounts as options", () => {
    const { container } = render(SelectAccountDropdown);

    // main + subaccounts + hardware wallets
    expect(container.querySelectorAll("option").length).toBe(
      1 + subaccounts.length + hardwareWallets.length
    );
  });

  it("should select main as default", () => {
    const { container } = render(SelectAccountDropdown);

    expect(container.querySelector("select")?.value).toBe(
      mockMainAccount.identifier
    );
  });

  it("should not render accounts hardware wallets", () => {
    const { container } = render(SelectAccountDropdown, {
      skipHardwareWallets: true,
    });

    // main + subaccounts
    expect(container.querySelectorAll("option").length).toBe(
      1 + subaccounts.length
    );
  });

  it("can select another account", async () => {
    const { container } = render(SelectAccountDropdown);

    const selectElement = container.querySelector("select");
    selectElement &&
      expect(selectElement.value).toBe(mockMainAccount.identifier);

    selectElement &&
      fireEvent.change(selectElement, {
        target: { value: subaccounts[0].identifier },
      });

    selectElement &&
      expect(selectElement.value).toBe(subaccounts[0].identifier);
  });
});
