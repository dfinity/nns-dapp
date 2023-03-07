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
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";

describe("SelectAccountDropdown", () => {
  describe("no accounts", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterEach(() => {
      accountsStore.reset();
    });

    const props = { rootCanisterId: OWN_CANISTER_ID };
    it("should render spinner", () => {
      accountsStore.reset();
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
      accountsStore.set({
        main: mockMainAccount,
        subAccounts,
        hardwareWallets,
        certified: true,
      });
    });

    afterEach(() => {
      accountsStore.reset();
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
