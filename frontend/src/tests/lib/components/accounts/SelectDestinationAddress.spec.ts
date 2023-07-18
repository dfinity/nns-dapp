/**
 * @jest-environment jsdom
 */

import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "$tests/mocks/accounts.store.mock";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsAccountsStoreSubscribe } from "$tests/mocks/sns-accounts.mock";
import { queryToggleById } from "$tests/utils/toggle.test-utils";
import { fireEvent, render, waitFor } from "@testing-library/svelte";

describe("SelectDestinationAddress", () => {
  describe("nns accounts", () => {
    const mockSubAccount2 = {
      ...mockSubAccount,
      identifier: "test-identifier",
    };
    const subaccounts = [mockSubAccount, mockSubAccount2];
    const hardwareWallets = [mockHardwareWalletAccount];

    jest
      .spyOn(icpAccountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe(subaccounts, hardwareWallets)
      );

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
    jest
      .spyOn(snsAccountsStore, "subscribe")
      .mockImplementation(mockSnsAccountsStoreSubscribe(mockPrincipal));

    it("should render the sns account", async () => {
      const { container, queryByTestId } = render(SelectDestinationAddress, {
        props: {
          rootCanisterId: mockPrincipal,
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
