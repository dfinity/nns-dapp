/**
 * @jest-environment jsdom
 */

import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SelectAccountDropdown", () => {
  describe("no accounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      icpAccountsStore.resetForTesting();
    });

    const props = { rootCanisterId: OWN_CANISTER_ID };
    it("should render spinner", () => {
      const { getByTestId } = render(SelectAccountDropdown, { props });

      expect(getByTestId("spinner")).toBeInTheDocument();
    });
  });

  describe("nns accounts", () => {
    const mockSubAccount2 = {
      ...mockSubAccount,
      identifier: "test-identifier",
    };
    const subAccounts = [mockSubAccount, mockSubAccount2];
    const hardwareWallets = [mockHardwareWalletAccount];

    beforeEach(() => {
      icpAccountsStore.setForTesting({
        main: mockMainAccount,
        subAccounts,
        hardwareWallets,
        certified: true,
      });
    });

    const props = { rootCanisterId: OWN_CANISTER_ID };
    it("should render accounts as options", () => {
      const { container } = render(SelectAccountDropdown, { props });

      // main + subaccounts + hardware wallets
      expect(container.querySelectorAll("option").length).toBe(
        1 + subAccounts.length + hardwareWallets.length
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
        1 + subAccounts.length
      );
    });

    it("should reset selected accounts on selectable list of accounts change", async () => {
      const { component } = render(SelectAccountDropdown, {
        props: {
          ...props,
          selectedAccount: mockHardwareWalletAccount,
        },
      });

      // We are interested in the bind value(s) not the one of the HTML element. It's the bind value that kept the wrong value in memory when we developed related fix.
      // In addition, the select binds `selectedAccountIdentifier` and we also want to ensure that the side effect resolve the `selectedAccount` when the code reset it.
      expect(component.$$.ctx[component.$$.props["selectedAccount"]]).toEqual(
        mockHardwareWalletAccount
      );

      const { component: component2 } = render(SelectAccountDropdown, {
        props: {
          ...props,
          selectedAccount: mockHardwareWalletAccount,
          filterAccounts: (account) => !isAccountHardwareWallet(account),
        },
      });

      await waitFor(() =>
        expect(
          component2.$$.ctx[component2.$$.props["selectedAccount"]]
        ).toEqual(mockMainAccount)
      );
    });

    it("can select another account", async () => {
      const { container } = render(SelectAccountDropdown, { props });

      const selectElement = container.querySelector("select");
      selectElement &&
        expect(selectElement.value).toBe(mockMainAccount.identifier);

      selectElement &&
        fireEvent.change(selectElement, {
          target: { value: subAccounts[0].identifier },
        });

      selectElement &&
        expect(selectElement.value).toBe(subAccounts[0].identifier);
    });
  });

  describe("sns accounts", () => {
    beforeEach(() => {
      snsAccountsStore.setAccounts({
        rootCanisterId: mockPrincipal,
        accounts: [mockSnsMainAccount],
        certified: true,
      });
    });

    afterEach(() => {
      snsAccountsStore.reset();
    });

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
