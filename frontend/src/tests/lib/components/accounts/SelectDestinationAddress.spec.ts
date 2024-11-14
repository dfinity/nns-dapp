import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { queryToggleById } from "$tests/utils/toggle.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SelectDestinationAddress", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetSnsProjects();
    icrcAccountsStore.reset();
  });

  describe("nns accounts", () => {
    const mockSubAccount2 = {
      ...mockSubAccount,
      identifier: "test-identifier",
    };
    const subaccounts = [mockSubAccount, mockSubAccount2];
    const hardwareWallets = [mockHardwareWalletAccount];

    beforeEach(() => {
      vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
        mockAccountsStoreSubscribe(subaccounts, hardwareWallets)
      );
    });

    it("should render address input as default", () => {
      const { container } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: OWN_CANISTER_ID,
        },
      });

      expect(
        container.querySelector("input[name='accounts-address']")
      ).toBeInTheDocument();
    });

    it("should render toggle", () => {
      const { container } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: OWN_CANISTER_ID,
        },
      });

      const toggle = queryToggleById(container);
      expect(toggle).toBeInTheDocument();
    });

    it("should not render toggle if no extra accounts to choose from", () => {
      const { container } = render(SelectDestinationAddress, {
        props: {
          filterAccounts: () => false,
          rootCanisterId: OWN_CANISTER_ID,
        },
      });

      const toggle = queryToggleById(container);
      expect(toggle).not.toBeInTheDocument();
    });

    it("should render select account dropdown when toggle is clicked", async () => {
      const { container, queryByTestId } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: OWN_CANISTER_ID,
        },
      });

      expect(
        container.querySelector("input[name='accounts-address']")
      ).toBeInTheDocument();

      const toggle = queryToggleById(container);
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
    });

    it("should not render toggle and address input if selection methods is dropdown", () => {
      const { container } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: OWN_CANISTER_ID,
          selectMethods: "dropdown",
        },
      });

      expect(container.querySelector("input[id='toggle']")).toBeNull();
      expect(
        container.querySelector("input[name='accounts-address']")
      ).toBeNull();
    });

    it("should not render dropdown and toggle if selection methods is manual", () => {
      const { container, queryByTestId } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: OWN_CANISTER_ID,
          selectMethods: "manual",
        },
      });

      expect(container.querySelector("input[id='toggle']")).toBeNull();
      expect(queryByTestId("select-account-dropdown")).toBeNull();
    });
  });

  describe("sns accounts", () => {
    const rootCanisterId = principal(1);
    const ledgerCanisterId = principal(2);

    beforeEach(() => {
      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId,
        },
      ]);
      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: {
          accounts: [mockSnsMainAccount],
          certified: true,
        },
      });
    });

    it("should render the sns account", async () => {
      const { container, queryByTestId } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId,
        },
      });

      expect(
        container.querySelector("input[name='accounts-address']")
      ).toBeInTheDocument();

      const toggle = queryToggleById(container);
      toggle && fireEvent.click(toggle);

      await waitFor(() =>
        expect(queryByTestId("select-account-dropdown")).toBeInTheDocument()
      );
    });
  });
});
