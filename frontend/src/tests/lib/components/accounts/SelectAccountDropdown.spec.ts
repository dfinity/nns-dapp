/**
 * @jest-environment jsdom
 */

import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { accountsStore } from "$lib/stores/accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
import { fireEvent, render } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import {
  mockSnsAccountsStoreSubscribe,
  mockSnsMainAccount,
} from "../../../mocks/sns-accounts.mock";

describe("SelectAccountDropdown", () => {
  describe("nns accounts", () => {
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

    const props = { rootCanisterId: OWN_CANISTER_ID };
    it("should render accounts as options", () => {
      const { container } = render(SelectAccountDropdown, { props });

      // main + subaccounts + hardware wallets
      expect(container.querySelectorAll("option").length).toBe(
        1 + subaccounts.length + hardwareWallets.length
      );
    });

    it("should select main as default", () => {
      const { container } = render(SelectAccountDropdown, { props });

      expect(container.querySelector("select")?.value).toBe(
        mockMainAccount.identifier
      );
    });

    it("should not render accounts hardware wallets", () => {
      const { container } = render(SelectAccountDropdown, {
        props: {
          filterAccounts: (account) => !isAccountHardwareWallet(account),
          rootCanisterId: OWN_CANISTER_ID,
        },
      });

      // main + subaccounts
      expect(container.querySelectorAll("option").length).toBe(
        1 + subaccounts.length
      );
    });

    it("can select another account", async () => {
      const { container } = render(SelectAccountDropdown, { props });

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

  describe("sns accounts", () => {
    jest
      .spyOn(snsAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

    it("should select main as default", () => {
      const { container } = render(SelectAccountDropdown, {
        props: {
          rootCanisterId: mockPrincipal,
        },
      });

      expect(container.querySelector("select")?.value).toBe(
        mockSnsMainAccount.identifier
      );
    });
  });
});
