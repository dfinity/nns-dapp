import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SelectAccountDropdown", () => {
  beforeEach(() => {
    resetSnsProjects();
  });

  describe("no accounts", () => {
    beforeEach(() => {
      resetAccountsForTesting();
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
      setAccountsForTesting({
        main: mockMainAccount,
        subAccounts,
        hardwareWallets,
        certified: true,
      });
    });

    const props = { rootCanisterId: OWN_CANISTER_ID };
    it("should render accounts as options", () => {
      const { container } = render(SelectAccountDropdown, { props });

      // main + subaccounts + Ledger devices
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

    it("should not render accounts Ledger devices", () => {
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
      setSnsProjects([
        {
          rootCanisterId: mockSnsFullProject.rootCanisterId,
          ledgerCanisterId: mockSnsFullProject.summary.ledgerCanisterId,
        },
      ]);

      icrcAccountsStore.set({
        ledgerCanisterId: mockSnsFullProject.summary.ledgerCanisterId,
        accounts: { accounts: [mockSnsMainAccount], certified: true },
      });
    });

    it("should select main as default", () => {
      const { container } = render(SelectAccountDropdown, {
        props: {
          rootCanisterId: mockSnsFullProject.rootCanisterId,
        },
      });

      expect(container.querySelector("select")?.value).toBe(
        mockSnsMainAccount.identifier
      );
    });
  });
});
